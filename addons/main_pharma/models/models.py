# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.addons.html_editor.controllers.main import HTML_Editor
from odoo.tools import html2plaintext
import re
import logging
from datetime import datetime, timedelta
import json

_logger = logging.getLogger(__name__)

class HospitalResUsersInherit(models.Model):
    _inherit = 'res.users'
    
    def js_ver(self):
        return int(datetime.timestamp(datetime.now()))

class AiOrderPointRecord(models.Model):
    _name = 'ai.orderpoint.record'
    _description = 'Ai Order Point Record'

    name = fields.Many2one('ai.orderpoint')
    product_id = fields.Many2one('product.product', required=True)
    # product_name = fields.Char()
    current_on_hand = fields.Float()
    min_reorder = fields.Float()
    virtual_available = fields.Float()
    monthly_sales_avg = fields.Float()
    applied_to_stock = fields.Boolean( default=False)

class AiProductsOrderPoint(models.Model):
    _name = 'ai.orderpoint'
    _description = 'Ai Order Point'

    name = fields.Char(default=lambda self: f"تحليل نقاط الطلب - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    ai_response = fields.Text()
    orderpoint_ids = fields.One2many('ai.orderpoint.record', 'name')
    state = fields.Selection([
        ('draft', 'مسودة'),
        ('processing', 'جاري المعالجة'),
        ('processed', 'تم المعالجة'),
        ('error', 'خطأ')
    ], default='draft')
    error_message = fields.Text()
    processed_count = fields.Integer(compute='_compute_processed_count')
    
    @api.depends('orderpoint_ids.applied_to_stock')
    def _compute_processed_count(self):
        for record in self:
            record.processed_count = len(record.orderpoint_ids.filtered(lambda x: x.applied_to_stock))

    def extract_order_points_from_ai_response(self, ai_response):
        """
        استخراج بيانات نقاط الطلب من رد الذكاء الاصطناعي - النسخة الجديدة مع JSON
        """
        order_points = []
        
        try:
            # البحث عن JSON في رد AI
            json_pattern = r'```json\s*(.*?)\s*```'
            json_match = re.search(json_pattern, ai_response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1)
            else:
                # إذا لم يكن هناك كود JSON، نبحث عن أي كائن JSON في النص
                json_pattern2 = r'\[\s*\{.*?\}\s*\]'
                json_match = re.search(json_pattern2, ai_response, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    # إذا لم نجد JSON، نستخدم الطريقة القديمة
                    return self._extract_using_old_method(ai_response)
            
            # تحليل JSON
            analysis_data = json.loads(json_str)
            _logger.info(f"Successfully parsed JSON data: {len(analysis_data)} products")
            
            for item in analysis_data:
                try:
                    order_points.append({
                        'product_name': item.get('product_name', ''),
                        'product_id': item.get('product_id'),
                        'current_on_hand': item.get('current_on_hand', 0),
                        'monthly_sales_avg': item.get('monthly_sales_avg', 0),
                        'min_reorder': item.get('min_reorder', 0)
                    })
                    _logger.info(f"Extracted: {item.get('product_name')} - Min: {item.get('min_reorder')}")
                    
                except (ValueError, KeyError) as e:
                    _logger.warning(f"Error parsing JSON item: {item}, Error: {e}")
                    continue
                    
        except json.JSONDecodeError as e:
            _logger.error(f"JSON decode error: {e}, falling back to old method")
            order_points = self._extract_using_old_method(ai_response)
        except Exception as e:
            _logger.error(f"Error in JSON extraction: {e}, falling back to old method")
            order_points = self._extract_using_old_method(ai_response)
        
        _logger.info(f"Extracted {len(order_points)} order points from AI response")
        return order_points

    def _extract_using_old_method(self, ai_response):
        """
        الطريقة القديمة لاستخراج البيانات (للتوافق مع الردود القديمة)
        """
        order_points = []
        
        patterns = [
            r'\*\*(.*?)\*\*.*?رقم تعريف المنتج.*?[:]?\s*(\d+).*?الكمية المتاحة.*?[:]?\s*(\d+\.?\d*).*?متوسط المبيعات الشهرية.*?[:]?\s*(\d+\.?\d*).*?الحد الأدنى المقترح.*?[:]?\s*(\d+\.?\d*)',
            r'\*\*(.*?)\*\*.*?product.*?[:]?\s*(\d+).*?available.*?[:]?\s*(\d+\.?\d*).*?monthly.*?[:]?\s*(\d+\.?\d*).*?min.*?[:]?\s*(\d+\.?\d*)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, ai_response, re.IGNORECASE | re.DOTALL)
            for match in matches:
                try:
                    product_name = match[0].strip()
                    product_id = int(match[1])
                    current_on_hand = float(match[2])
                    monthly_avg = float(match[3])
                    min_reorder = float(match[4])
                    
                    order_points.append({
                        'product_name': product_name,
                        'product_id': product_id,
                        'current_on_hand': current_on_hand,
                        'monthly_sales_avg': monthly_avg,
                        'min_reorder': min_reorder
                    })
                except (ValueError, IndexError) as e:
                    _logger.warning(f"Error parsing match: {match}, Error: {e}")
                    continue
        
        return order_points

    def prepare_system_data(self):
        """
        تحضير البيانات النظامية للذكاء الاصطناعي بشكل أكثر كفاءة
        """
        try:
            # فلترة الفواتير لآخر 3 أشهر للبيانات الأكثر صلة
            three_months_ago = fields.Date.today() - timedelta(days=90)
            
            invoices = self.env["account.move"].sudo().search([
                ('move_type', 'in', ['out_invoice', 'out_refund']),
                ('invoice_date', '>=', three_months_ago),
                ('state', '=', 'posted')
            ], limit=50)

            products = self.env["product.product"].sudo().search([("purchase_ok", "=", True),])

            # تحضير بيانات الفواتير بشكل أكثر كفاءة
            sys_invoices = {}
            for invoice in invoices:
                invoice_lines = []
                for line in invoice.invoice_line_ids:
                    if line.product_id and line.product_id.purchase_ok:
                        invoice_lines.append({
                            "product_id": line.product_id.id,
                            "product_name": line.product_id.name,
                            "quantity": line.quantity,
                            "current_on_hand": line.product_id.qty_available,
                            "virtual_available": line.product_id.virtual_available,
                        })
                
                if invoice_lines:
                    sys_invoices[f"invoice_{invoice.id}"] = {
                        "invoice_lines": invoice_lines,
                        "invoice_date": invoice.invoice_date.strftime('%Y-%m-%d') if invoice.invoice_date else None,
                        "invoice_client": {"id": invoice.partner_id.id, "name": invoice.partner_id.name},
                        "invoice_type": invoice.move_type,
                    }

            # تحضير بيانات المنتجات
            sys_products = []
            for product in products:
                sys_products.append({
                    "product_id": product.id,
                    "product_name": product.name,
                    "current_on_hand": product.qty_available,
                    "virtual_available": product.virtual_available,
                    "incoming_qty": product.incoming_qty,
                    "outgoing_qty": product.outgoing_qty,
                })
            
            _logger.info(f"Prepared data: {len(sys_products)} products, {len(sys_invoices)} invoices")
            return {
                'invoices': sys_invoices,
                'products': sys_products
            }
            
        except Exception as e:
            _logger.error(f"Error preparing system data: {str(e)}")
            return {'invoices': {}, 'products': []}

    def create_ai_orderpoint_records(self, order_points_data):
        """
        إنشاء سجلات نقاط الطلب بناء على بيانات AI
        """
        try:
            record_vals_list = []
            successful_products = []
            
            for op_data in order_points_data:
                # البحث عن المنتج باستخدام ID أولاً، ثم الاسم إذا فشل
                product = self.env['product.product'].sudo().browse(op_data.get('product_id'))
                
                if not product.exists():
                    product = self.env['product.product'].sudo().search([
                        ('name', '=ilike', op_data['product_name']),
                        ('purchase_ok', '=', True)
                    ], limit=1)
                
                if product:
                    record_vals = {
                        "name":self.id,
                        'product_id': product.id,
                        'current_on_hand': op_data.get('current_on_hand', product.qty_available),
                        'min_reorder': op_data.get('min_reorder', 0),
                        'monthly_sales_avg': op_data.get('monthly_sales_avg', 0),
                        'virtual_available': product.virtual_available,
                    }
                    record_vals_list.append(record_vals)
                    successful_products.append(product.name)
                    _logger.info(f"Created record for {product.name}: min_reorder={record_vals['min_reorder']}")
                else:
                    _logger.warning(f"Product not found: {op_data['product_name']} (ID: {op_data.get('product_id')})")

            # حذف السجلات القديمة وإنشاء جديدة
            self.orderpoint_ids.unlink()
            order_points_recods = self.env["ai.orderpoint.record"].sudo().create(record_vals_list)
            # for r in record_vals_list:
            #     order_points_recods.sudo()

            # if record_vals_list:
            #     self.orderpoint_ids = [(0, 0, vals) for vals in record_vals_list]
            #     _logger.info(f"Successfully created {len(record_vals_list)} order point records")
            # else:
            #     _logger.warning("No order point records were created")
                
            return len(record_vals_list)
            
        except Exception as e:
            _logger.error(f"Error creating AI orderpoint records: {str(e)}")
            return 0

    @api.model_create_multi
    def create(self, vals_list):
        """
        تحسين عملية الإنشاء مع معالجة الأخطاء - النسخة الجديدة مع JSON
        """
        orderpoints = super().create(vals_list)
        
        for orderpoint in orderpoints:
            try:
                orderpoint.state = 'processing'
                
                # 1. تحضير البيانات
                system_data = orderpoint.prepare_system_data()
                
                if not system_data['products']:
                    orderpoint.error_message = "لا توجد منتجات متاحة للتحليل"
                    orderpoint.state = 'error'
                    continue

                # 2. إنشاء المحادثة مع AI - النسخة الجديدة مع طلب JSON
                response_rules_text = """
                                            قواعد الرد المطلوبة:
                                            1. قم بتحليل سجل المبيعات والكميات المتاحة لكل منتج
                                            2. اقترح الحد الأدنى لإعادة الطلب لكل منتج بناء على:
                                            - متوسط المبيعات الشهرية
                                            - الوقت اللازم للتوريد (7 أيام)
                                            - مستوى الخدمة المطلوب (95%)
                                            3. يجب أن يكون الرد بالصيغة التالية فقط (JSON format):
                                            ```json
                                            [
                                                {
                                                    "product_id": رقم_المنتج,
                                                    "product_name": "اسم المنتج",
                                                    "current_on_hand": الكمية_المتاحة,
                                                    "monthly_sales_avg": متوسط_المبيعات_الشهرية,
                                                    "min_reorder": الحد_الأدنى_المقترح
                                                },
                                                ...
                                            ]
                                            ```
                                            4. ركز على المنتجات التي:
                                            - الكمية المتاحة = 0
                                            - الكمية المتاحة أقل من متوسط المبيعات الأسبوعية
                                            5. لا تضيف أي نص خارج كود JSON
                                        """

                conversation_history = [{
                    "role": "system", 
                    "content": f"""
                        أنت Madar Ai - مساعد ذكي متخصص في إدارة المخزون
                        تم تصميمك بواسطة Madardev

                        مهمتك: تحليل المنتجات وتحديد الحد الأدنى الأمثل لإعادة الطلب

                        البيانات المتوفرة:
                        - عدد المنتجات: {len(system_data['products'])}
                        - عدد الفواتير: {len(system_data['invoices'])}
                        - المستخدم: {self.env.user.name}

                        {response_rules_text}

                        بيانات المنتجات :
                        {json.dumps(system_data['products'], ensure_ascii=False)}

                        بيانات الفواتير :
                        {json.dumps(list(system_data['invoices'].values()), ensure_ascii=False)}
                        """
                }]

                # 3. التواصل مع AI
                prompt_text = 'قم بتحليل المنتجات واقترح الحد الأدنى لإعادة الطلب لكل منتج بناء على سجل المبيعات والمخزون الحالي. يجب أن يكون الرد بصيغة JSON فقط كما هو محدد في التعليمات.'
                
                _logger.info("Sending request to AI with JSON format...")
                editor = HTML_Editor()
                ai_response = editor.generate_text(
                    prompt=prompt_text,
                    conversation_history=conversation_history
                )
                
                orderpoint.ai_response = ai_response
                _logger.info(f"AI Response received: {len(ai_response)} characters")
                
                # 4. استخراج البيانات وإنشاء السجلات
                order_points_data = orderpoint.extract_order_points_from_ai_response(ai_response)
                if order_points_data:
                    records_count = orderpoint.create_ai_orderpoint_records(order_points_data)
                    _logger.info(f"Successfully created {records_count} AI orderpoint records")
                    orderpoint.state = 'processed'
                else:
                    error_msg = "لم يتم استخراج بيانات نقاط الطلب من رد الذكاء الاصطناعي. تأكد من أن الرد بصيغة JSON الصحيحة."
                    orderpoint.error_message = error_msg
                    orderpoint.state = 'error'
                    _logger.warning(error_msg)
                    
            except Exception as e:
                error_msg = f"Error in AI orderpoint creation: {str(e)}"
                _logger.error(error_msg)
                orderpoint.error_message = error_msg
                orderpoint.state = 'error'
        
        return orderpoints

    # باقي الدوال تبقى كما هي (update_stock_orderpoints, action_apply_to_stock, etc.)
    def update_stock_orderpoints(self):
        """
        تحديث نقاط الطلب الفعلية في stock.warehouse.orderpoint
        """
        try:
            updated_count = 0
            created_count = 0
            
            for ai_record in self.orderpoint_ids.filtered(lambda r: r.min_reorder > 0 and not r.applied_to_stock):
                product = ai_record.product_id
                
                if not product:
                    continue
                
                # البحث عن نقطة طلب موجودة
                existing_orderpoint = self.env['stock.warehouse.orderpoint'].sudo().search([
                    ('product_id', '=', product.id)
                ], limit=1)
                
                if existing_orderpoint:
                    # تحديث النقطة الموجودة
                    existing_orderpoint.write({
                        'product_min_qty': ai_record.min_reorder,
                        'product_max_qty': max(ai_record.min_reorder * 2, ai_record.min_reorder + 10)
                    })
                    updated_count += 1
                    _logger.info(f"Updated order point for {product.name}: min_qty={ai_record.min_reorder}")
                else:
                    # إنشاء نقطة طلب جديدة
                    warehouse = self.env['stock.warehouse'].search([], limit=1)
                    location = self.env['stock.location'].search([('usage', '=', 'internal')], limit=1)
                    
                    if warehouse and location:
                        self.env['stock.warehouse.orderpoint'].sudo().create({
                            'name': f'AI Order Point - {product.name}',
                            'product_id': product.id,
                            'product_min_qty': ai_record.min_reorder,
                            'product_max_qty': max(ai_record.min_reorder * 2, ai_record.min_reorder + 10),
                            'warehouse_id': warehouse.id,
                            'location_id': location.id,
                        })
                        created_count += 1
                        _logger.info(f"Created order point for {product.name}: min_qty={ai_record.min_reorder}")
                
                ai_record.applied_to_stock = True
            
            self.state = 'processed'
            result = {
                'updated': updated_count,
                'created': created_count,
                'total': updated_count + created_count
            }
            _logger.info(f"Stock orderpoints update result: {result}")
            return result
            
        except Exception as e:
            _logger.error(f"Error updating stock orderpoints: {str(e)}")
            self.state = 'error'
            self.error_message = f"خطأ في تحديث نقاط الطلب: {str(e)}"
            return {'updated': 0, 'created': 0, 'total': 0}

    def action_apply_to_stock(self):
        """
        تطبيق التوصيات على نظام المخزون
        """
        result = self.update_stock_orderpoints()
        
        if result['total'] > 0:
            message = f"تم تحديث {result['updated']} نقطة طلب وإنشاء {result['created']} نقطة جديدة"
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'نجاح',
                    'message': message,
                    'type': 'success',
                    'sticky': False,
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'تحذير',
                    'message': 'لم يتم تطبيق أي تغييرات على نقاط الطلب',
                    'type': 'warning',
                    'sticky': True,
                }
            }

    def action_retry_ai_analysis(self):
        """
        إعادة محاولة التحليل للسجلات التي فشلت
        """
        for record in self.filtered(lambda r: r.state == 'error'):
            record.write({'state': 'draft', 'error_message': False})
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'تم',
                'message': 'تم إعادة تعيين الحالة للمحاولة مرة أخرى',
                'type': 'success',
                'sticky': False,
            }
        }