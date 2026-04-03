# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import content_disposition, Controller, request, route
import werkzeug
import werkzeug.exceptions
import werkzeug.urls
import werkzeug.wrappers
import base64
import json
import logging
_logger = logging.getLogger(__name__)


class MainPharma(http.Controller):
    @http.route('/my/vendor/products', auth='user', website=True)
    def index(self, **kw):
        val = {}
        products = request.env["product.product"].sudo().search([("purchase_ok","=",True),("type","=","consu")])
        val["products"] = products
        return request.render('main_pharma.vendor_test', val)

#     @http.route('/main_pharma/main_pharma/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('main_pharma.listing', {
#             'root': '/main_pharma/main_pharma',
#             'objects': http.request.env['main_pharma.main_pharma'].search([]),
#         })

#     @http.route('/main_pharma/main_pharma/objects/<model("main_pharma.main_pharma"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('main_pharma.object', {
#             'object': obj
#         })

