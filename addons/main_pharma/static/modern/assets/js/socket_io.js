var socket = io("https://ws.madar-clinic.com",{
            query: { user_id: odoo.user.id, 
                     user_name: odoo.user.name, 
                     user_role: odoo.user.role, 
                  }
      }
);

socket.emit("join_system", "system1");
socket.emit("join_system", "system1_role_"+odoo.user.role);

// socket.on("system_response", function(data) {
//       console.log( data);
// });


$(document).on("keydown", "textarea", function(e) {
    if (e.key === "Enter") {
        if (e.shiftKey) {
            // Shift + Enter → يسمح بسطر جديد
            return true;
        } else {
            // Enter فقط → امنع الافتراضي واعمل submit
            e.preventDefault();
            // let content = $(this).val().replace(/\n/g, "<br>");
            // $(this).val(content);
            $(this).closest("form").submit();
        }
    }
});