/** Hide Invite People & Member List **/
console.log("Start Hide Invite")
odoo.define('madar_discuss_hide_invite_member', [
    '@mail/core/common/thread_actions'
], function (require) {
    'use strict';

    const { threadActionsRegistry } = require('@mail/core/common/thread_actions');

    // Hide "Invite People"
    const invite = threadActionsRegistry.get('invite-people');
    if (invite) {
        invite.condition = () => false;
    }

    // Hide "Members"
    const members = threadActionsRegistry.get('member-list');
    if (members) {
        members.condition = () => false;
    }
});
