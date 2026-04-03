# -*- coding: utf-8 -*-
{
    'name': "Fantasy Game",

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': """ Long description of module's purpose """,

    'author': "MadarDev",
    'website': "https://madardev.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'website',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','crm','website'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'data/pre_data.xml',
        'views/views.xml',
        'views/templates.xml',
        'views/supscription.xml',
        'views/supsciption_home.xml',
        'views/layout.xml',
        'views/modals.xml',
        'views/offcanvas.xml',
        'views/layout_side_bar.xml',
        'views/layout_main_js.xml',
        'views/layout_main_css.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'license': 'OPL-1',
    'sequence': 1,
    'installable': True,
    'auto_install': False,
    'application': True,
}

