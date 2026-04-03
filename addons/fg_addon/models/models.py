# -*- coding: utf-8 -*-

from odoo import models, fields, api
import json
from datetime import datetime, timedelta
import pytz
import requests
import base64
import os
import jwt
import hmac, hashlib
jwt_secret_key = "8hT7vL9dQoBzNHbK/pVcRw=="
import qrcode
import base64
from io import BytesIO
import urllib.parse


import logging
_logger = logging.getLogger(__name__)



class ResPartnerInherit(models.Model):
    _inherit = 'res.partner'
    is_player = fields.Boolean(default=False)
    is_shop_user = fields.Boolean(default=False)
    subscription_plan_id = fields.One2many('player_subscription', 'player', string="Subscription Plan")
    current_active_subscription = fields.Many2one('player_subscription', domain=[('active', '=', True)], string="Current Active Subscription")
    subscription_usage_ids = fields.One2many('player_subscription.usage', 'name', string="Subscription Usage")

    def player_qr_base64(self):
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        code = self.uniqe_player_code()
        player_url = f"{base_url}/player/subscription/{self.uniqe_player_code()}"
        qr_img = qrcode.make(player_url)
        buf = BytesIO()
        qr_img.save(buf, format="PNG")
        qr_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{qr_b64}"

    def whatsapp_link(self):
        
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        code = self.uniqe_player_code()
        player_url = f"{base_url}/player/subscription/{self.uniqe_player_code()}"

        msg = (
            f"أهلاً {self.name} 👋\n"
            f"تم تفعيل اشتراكك 💎 ({self.current_active_subscription.name.name if self.current_active_subscription else ''})\n\n"
            "🎮 نرحب فيك باللعبة الخيالية!\n\n"
            f"📆 ومن هنا تقدر تشوف كم باقي لاشتراكك:\n{player_url}\n\n"
            "📸 ولا تنسى تشاركنا لقطاتك عبر سناب شات!\n"
            "🔗 https://snapchat.com/t/lLkwyP3A"
        )

        encoded_msg = urllib.parse.quote(msg, safe='', encoding='utf-8')
        phone = self.mobile.replace("+", "").replace(" ", "") if self.mobile else ""
        return f"https://api.whatsapp.com/send?phone={phone}&text={encoded_msg}"

    
    def uniqe_player_code(self):
        code = f"{self.id}-{int(datetime.timestamp(self.create_date))}"
        return code
    
    # ✅ Check for running session
    
    def has_running_session(self):
        for partner in self:
            running = partner.subscription_usage_ids.filtered(lambda u: u.status == 'running')
            return bool(running)
    
    # ✅ Check if player can start a session (≥ 5 min left)
    def can_start_session(self):
        if self.has_running_session():
            return False
        if not self.current_active_subscription:
            return False
        today = fields.Date.today()
        usages = self.current_active_subscription.subscription_usage_ids.filtered(lambda u: u.start and u.start.date() == today)
        total_used = sum(usages.mapped('duration'))
        total_allowed = self.current_active_subscription.name.hours or 0
        remaining = max(total_allowed - total_used, 0)
        return remaining >= (5 / 60)
    
    
    # ✅ Get the current running session ID
    def Current_running_session(self):
        for partner in self:
            running = partner.subscription_usage_ids.filtered(lambda u: u.status == 'running')
            return running[-1].id if running else False

    # ✅ Start new session safely
    def start_session(self):
        self.ensure_one()
        if not self.current_active_subscription:
            return False

        if self.has_running_session():
            _logger.warning(f"Player {self.name} already has a running session.")
            return False

        subscription = self.current_active_subscription
        new_session = self.env['player_subscription.usage'].sudo().create({
            'name': self.id,
            'subscription': subscription.id,
            'start': fields.Datetime.now(),
            'status': 'running',
        })
        return new_session.id if new_session else False


class PlayerSubscription(models.Model):
    _name = 'player_subscription'
    _description = 'Player Subscription'

    name = fields.Many2one("player_subscription.plan", string="Subscription Name", required=True)
    player = fields.Many2one("res.partner", string="Player", required=True)
    start = fields.Date(string="Start Date", required=True)
    end = fields.Date(string="End Date", required=True)
    active = fields.Boolean(default=True)
    subscription_usage_ids = fields.One2many('player_subscription.usage', 'subscription', string="Subscription Usage")

    # ✅ Helper function
    def _format_hours(self, total_hours):
        hours = int(total_hours)
        minutes = int(round((total_hours - hours) * 60))
        return f"{hours:02d}:{minutes:02d}"
    
    def _plan_total_allowed_hours(self):
        """Return total allowed hours for the whole subscription period (float)."""
        if not self.start or not self.end or not self.name:
            return 0.0
        # Convert Odoo date strings to python date
        start_date = fields.Date.from_string(self.start)
        end_date = fields.Date.from_string(self.end)
        # Inclusive days count
        days = (end_date - start_date).days + 1
        if days < 0:
            return 0.0
        daily_hours = float(self.name.hours or 0)
        return daily_hours * days

    # ✅ Today's usage in HH:MM
    def today_usage(self):
        today = fields.Date.today()
        usages = self.subscription_usage_ids.filtered(lambda u: u.start and u.start.date() == today)
        total = sum(usages.mapped('duration'))
        return self._format_hours(total)

    # ✅ Remaining time in HH:MM
    def today_remaining(self):
        today = fields.Date.today()
        usages = self.subscription_usage_ids.filtered(lambda u: u.start and u.start.date() == today)
        total_used = sum(usages.mapped('duration'))
        total_allowed = self.name.hours or 0
        remaining = max(total_allowed - total_used, 0)
        return self._format_hours(remaining)

    

    def plan_usage(self):
        total = sum(self.subscription_usage_ids.mapped('duration'))
        return self._format_hours(total)

    def plan_remaining(self):
        """Remaining hours for whole subscription period in HH:MM."""
        total_used = sum(self.subscription_usage_ids.mapped('duration'))
        total_allowed = self._plan_total_allowed_hours()
        remaining = max(total_allowed - total_used, 0.0)
        return self._format_hours(remaining)


class PlayerSubscriptionPlan(models.Model):
    _name = 'player_subscription.plan'
    _description = 'Player Subscription Plan'

    name = fields.Char(string="Subscription Name", required=True)
    hours = fields.Integer(string="Hours", required=True)
    price = fields.Float(string="Price")
    player_subscription_ids = fields.One2many('player_subscription', 'name', string="Players")


class PlayerSubscriptionUsage(models.Model):
    _name = 'player_subscription.usage'
    _description = 'Player Subscription Usage'

    name = fields.Many2one('res.partner', string="Subscription Usage")
    subscription = fields.Many2one('player_subscription', string="Subscription")
    start = fields.Datetime(string="Start Date", required=True)
    end = fields.Datetime(string="End Date")
    duration = fields.Float(string="Duration (hours)", compute="_compute_duration", store=True)
    status = fields.Selection([("running", "Running"), ("finished", "Finished")], string="Status", default="running", required=True)

    @api.depends('start', 'end')
    def _compute_duration(self):
        for rec in self:
            if rec.start and rec.end:
                delta = rec.end - rec.start
                rec.duration = delta.total_seconds() / 3600.0
            else:
                rec.duration = 0.0

    def end_session(self):
        """End current session and compute duration"""
        for rec in self:
            if rec.status == "running":
                rec.end = fields.Datetime.now()
                rec.status = "finished"
                rec._compute_duration()
