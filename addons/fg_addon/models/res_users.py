# -*- coding: utf-8 -*-

from odoo import models, fields, api
import json
from datetime import datetime, timedelta
import pytz
import requests
import base64
import os
import logging
_logger = logging.getLogger(__name__)

class HospitalResUsersInherit(models.Model):
    _inherit = 'res.users'

    def js_ver(self):
        return int(datetime.timestamp(datetime.now()))
    def layout_country_list(self):
        val = []
        for country in self.env["res.country"].sudo().search([]):
            val.append({
                        'id':country.id,
                        'name':country.name,
                        'current': True if self.env.company.country_id.id == country.id else False,
                        'flag':country.image_url,
                        'code':country.code
                        })
        return json.dumps(val)