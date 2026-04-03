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

class FgAddon(http.Controller):
    @http.route('/players', auth='user')
    def index(self, **kw):
        val = {}
        players = request.env["res.partner"].sudo().search([("is_player", "=", True)])
        val["players"] = players
        return request.render('fg_addon.players', val)
    
    @route('/ajax/start_player_session', type='http', auth="user", website=True,csrf=False)
    def start_player_session(self,**kw):
        val = {}
        player_id = kw.get('player_id')
        if player_id:
            player = request.env['res.partner'].sudo().browse(int(player_id))
            if player.exists() and player.is_player:
                session_id = player.start_session()
                if session_id:
                    val['status'] = 'success'
                    val['session_id'] = session_id
                else:
                    val['status'] = 'error'
                    val['message'] = 'Unable to start session'
            else:
                val['status'] = 'error'
                val['message'] = 'Invalid player'
        else:
            val['status'] = 'error'
            val['message'] = 'Missing player_id'
        
        
        return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')])
        
    
    @route('/ajax/add_player_contact', type='http', auth="user", website=True,csrf=False)
    def add_player_contact(self,**kw):
        _logger.info(kw)
        
        val = {}
        partner_sudo = request.env['res.partner'].sudo()
        
        name = kw.get('name')
        mobile = kw.get('mobile')
        if mobile:
            exist = request.env['res.partner'].sudo().search([('phone_mobile_search', 'like', mobile)])
            if exist:
                val['status'] = 'error'
                val['message'] = 'Mobile number already exists'
                val["error"] = 'Mobile number already exists'
                
                return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')])
        
        
        player = partner_sudo.create({
            'name': name,
            'mobile': mobile,
            'is_player': True,
        })
        
        if player:
            
            if kw.get('plan_id') and kw.get("from_date") and kw.get("to_date"):
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
            val['player_id'] = player.id # player.id
        else:
            val['status'] = 'error'
            val['message'] = 'Unable to create player'
            val["error"] = 'Unable to create player'
        
        return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')])
        

        
        
        
    @route('/ajax/end_player_session', type='http', auth="user", website=True,csrf=False)
    def end_player_session(self,**kw):
        val = {}
        player_session = kw.get('player_session')
        if player_session:
            player_session = request.env['player_subscription.usage'].sudo().browse(int(player_session))
            if player_session.exists():
                player_session.end_session()
                val['status'] = 'success'
                val['message'] = 'Session ended successfully'
            else:
                val['status'] = 'error'
                val['message'] = 'Invalid player session'
                
        else:
            val['status'] = 'error'
            val['message'] = 'Missing player session'
        
        
        return request.make_response(json.dumps(val),headers=[('Content-Type', 'application/json')])
        
        
    @route('/ajax/staff/image/<int:user_id>/<string:t>', type='http', auth="public", website=True,csrf=False)
    def staff_image(self, user_id,t):
        user = request.env['res.users'].sudo().browse(user_id)
        if not user:
            return request.not_found()

        # Odoo stores images base64 encoded
        if t == "l":
            image_data = base64.b64decode(user.image_1920) if user.image_1920 else base64.b64decode(user.avatar_1920)
        if t == "c":
            image_data = base64.b64decode(user.employee_id.cover)
        # content_type = mimetypes.guess_type(image_data)
        return request.make_response(image_data,headers=[('Content-Type', 'image/png')])