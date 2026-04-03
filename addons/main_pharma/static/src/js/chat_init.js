/** @odoo-module **/

import { whenReady } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { makeEnv, startServices } from "@web/env";

whenReady(async () => {
    const env = makeEnv();
    await startServices(env);
    
    // Messaging service should auto-initialize ChatHub
    const messaging = env.services.messaging;
    await messaging.isReady;
    
    console.log('Messaging ready:', messaging);
});