# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import content_disposition, Controller, request, route
import re
import base64
# import mimetypes
import logging
from datetime import datetime, timedelta
import json

_logger = logging.getLogger(__name__)

import requests


class FgAddon(http.Controller):
    @http.route('/player/subscription/<string:subscription>', auth='public')
    def index(self, subscription,**kw):
        val = {}
        plans = request.env['player_subscription.plan'].sudo().search([])
        val["plans"] = plans
        
        try:
            puid, token = subscription.split("-")
            partner = request.env['res.partner'].sudo().browse(int(puid))

            if not partner.exists():
                
                val["error"] = "Invalid User Info"
                return request.render('fg_addon.supscription_no_player', val)

            # تحقق من صحة الكود
            valid_code = partner.uniqe_player_code()
            if subscription == valid_code:
                val["player"] = partner
                val["subscription"] = partner.current_active_subscription
                
                return request.render('fg_addon.supscription_player', val)
            else:
                
                val["error"] = "Invalid Subscription Info"
                return request.render('fg_addon.supscription_wrong_link', val)

        except Exception as e:
            _logger.error(f"Subscription link error: {e}")
            
            val["error"] = "Invalid Url"
            return request.render('fg_addon.supscription_wrong_link', val)
    
    
    
    
    
    
    @route('/ajax/end_player_subscription', type='http', auth="user", website=True,csrf=False)
    def end_player_subscription(self, **kw):
        val = {}
        val["kw"] = kw
        if kw.get('subscription_id'):
            subscription = request.env['player_subscription'].sudo().browse(int(kw.get('subscription_id')))
            if subscription.exists():
                subscription.active = False
                if subscription.player.has_running_session():
                    Current_session = subscription.player.Current_running_session()
                    if Current_session:
                        request.env['player_subscription.usage'].sudo().browse(Current_session).sudo().end_session()
                    subscription.player.current_active_subscription = False
                else:
                    subscription.player.current_active_subscription = False
                
                
                
                val['status'] = 'success'
                val['message'] = 'Subscription ended successfully'
            else:
                val['status'] = 'error'
                val['message'] = 'Invalid subscription'
                val['error'] = 'Invalid subscription'
                
        else:
            val['status'] = 'error'
            val['message'] = 'Missing subscription'
            val['error'] = 'Missing subscription'
        
        
        
        return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')])
        
    @route('/ajax/manage_edit_player_subscription', type='http', auth="user", website=True,csrf=False)
    def manage_edit_player_subscription(self, **kw):
        val = {}
        val["kw"] = kw
        if kw.get('id') and kw.get('plan_id') and kw.get("from_date") and kw.get("to_date"):
            player = request.env['res.partner'].sudo().browse(int(kw.get('id')))
            if player.exists():
                if player.current_active_subscription:
                    player.current_active_subscription.active = False
                    player.current_active_subscription = False
                new_subscription = request.env['player_subscription'].sudo().create({
                    "name": int(kw.get('plan_id')),
                    "player": player.id,
                    "start": kw.get("from_date"),
                    "end": kw.get("to_date"),
                    "active": True,
                })
                if new_subscription:
                    player.current_active_subscription = new_subscription.id
                    val['status'] = 'success'
                    val['player_id'] = player.id
                    val['subscription'] = new_subscription.id
                else:
                    val['status'] = 'error'
                    val['message'] = 'Unable to create player'
                    val["error"] = 'Unable to create player'
                    

            else:
                val["error"] = "Invalid Player"
            
        else:
            val["error"] = "Data Is Missing"
        return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')])
    
    
    @route('/ajax/select2/subscription_plan_select2', type='http', auth="user", website=True,csrf=False)
    def subscription_plan_select2(self, **kw):
        pass
        val = []
        states = request.env['player_subscription.plan'].sudo().search([])
        for s in states:
            val.append({"id":s.id,"text":s.name})

        return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')]) 
    
    
    @route('/ajax/layout_check_whats_number', type='http', auth="user", website=True,csrf=False)
    def layout_check_whats_number(self, **kw):
        val={}
        
        
        val["res"] = kw
        

        url = f"https://wa_clien.madar-clinic.com/receive/{kw.get('number')}"
        
        headers = {
            'User-Agent': 'Madar-Clinic-Server/1.0',
            'Accept': 'application/json'
        }
    
    
        try:
            resp = requests.get(url, headers=headers, timeout=15,verify=False)
            data = resp.json()
            if resp.status_code == 200 :
                
                val["resp"] = data

            val["error"] = data
        
        except Exception as e:
            val["error"] = str(e)
            
        
        
        return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')])
