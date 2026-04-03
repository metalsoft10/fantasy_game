$(document).on("click",".start_player_session",function(e){
    e.preventDefault();
    var player_id = $(this).data('player_id');
    if(player_id){

        show_app_loader()
        var formData = new FormData()
        formData.append('player_id',player_id);
        $.ajax({
                type: "POST",
                url: "/ajax/start_player_session",
                data: formData,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function( data ){
                    hide_app_loader()
                    if(data.status === 'success') {
                        console.log('Session started:', data.session_id);
                        window.location.reload()
                    }else{
                        showError("Error", data.message);
                    }
                },
                error: function( jqXhr, textStatus, errorThrown ){
                    hide_app_loader()
                    showError("error",errorThrown)
                    console.log("error",errorThrown);
                }
        });
    }
})

$(document).on("click",".end_player_session",function(e){
    e.preventDefault();
    var player_session = $(this).data('player_session');
    if(player_session){
        show_app_loader()
        var formData = new FormData()
        formData.append('player_session',player_session);
        $.ajax({
                type: "POST",
                url: "/ajax/end_player_session",
                data: formData,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function( data ){
                    hide_app_loader()
                    if(data.status === 'success') {
                        console.log('Session Ended:', data.session_id);
                        window.location.reload()
                    }else{
                        showError("Error", data.message);
                    }
                },
                error: function( jqXhr, textStatus, errorThrown ){
                    hide_app_loader()
                    showError("error",errorThrown)
                    console.log("error",errorThrown);
                }
        })
    }
});

window.modalConfigs["player"] = {
    form_post_url:"/ajax/add_player_contact",
    form: sharedModalFormTmpl({
                                member_image:`<br/><br/>`,
                                cover: sharedModal_cover_Tmpl({title:"Add Player",with_input:false}),
                                inputs: sharedModal_generateFields([
                                            { id:'sharedModal_name', type: 'text', name: 'name', label: "Name", placeholder: "Enter Player Name", required: true },
                                            { id:'sharedModal_mobile', type: 'mobile', name: 'mobile', label: 'Mobile', placeholder: "Enter Player Mobile Number", autocomplete:"new-mobile", required: true },
                                            { id:'sharedModal_Subscrip_plan' ,type: 'select', name: 'plan_id', label: 'Plan', placeholder: 'Select Plan'},
                                            [
                                                { id:'sharedModal_from_date', type: 'text', name: 'from_date', label: "From Date", placeholder: "Enter Start Date",hidden:true},
                                                { id:'sharedModal_to_date', type: 'text', name: 'to_date', label: "To Date", placeholder: "Enter End Date",hidden:true},

                                            ],
                                            
                                        ])
                            }),
    befor_post:(formData) => {
        
        return true;
    },
    onSave: (data) => {   
        document.activeElement.blur();
        $("#sharedModal").modal("hide");
        window.location.reload()
    },
    onShowModal: () => {
        set_select2_elm('Select Plan ', '/ajax/select2/subscription_plan_select2' ,'#sharedModal_Subscrip_plan', { closeOnSelect: true, dropdownParent: '#sharedModal' });
        $(document).on('change', '#sharedModal_Subscrip_plan', function(e) {
            var plan_id = $(this).val();
            if(plan_id){
                $("#sharedModal_from_date").closest(".sharedModal_hidden").show();
                $("#sharedModal_from_date").attr("required","")
                $("#sharedModal_from_date").datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    minDate: 0,
                    showAnim: "fadeIn",
                    onSelect: function(selectedDate) {
                        let fromDate = $.datepicker.parseDate("yy-mm-dd", selectedDate);
                        let minToDate = new Date(selectedDate);
                        minToDate.setDate(minToDate.getDate() + 1);
                        $("#sharedModal_to_date").datepicker("option", "minDate", minToDate);
                        let autoToDate = new Date(fromDate);
                        autoToDate.setDate(autoToDate.getDate() + 30);
                
                        let formattedToDate = $.datepicker.formatDate("yy-mm-dd", autoToDate);
                        console.log("Auto set to_date:", formattedToDate);
                
                        $("#sharedModal_to_date").datepicker("setDate", formattedToDate);
                    }    
                });


                $("#sharedModal_to_date").closest(".sharedModal_hidden").show();
                $("#sharedModal_to_date").attr("required","")
                $("#sharedModal_to_date").datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    minDate: 1,
                    showAnim: "fadeIn"    
                });

            }else{
                
                $("#sharedModal_from_date").val("")
                $("#sharedModal_from_date").closest(".sharedModal_hidden").hide();
                $("#sharedModal_from_date").removeAttr("required")
                $("#sharedModal_to_date").val("")
                $("#sharedModal_to_date").closest(".sharedModal_hidden").hide();
                $("#sharedModal_to_date").removeAttr("required")
            }
        })
    }
};

window.modalConfigs["player_subscription"] = {
    form_post_url:"/ajax/manage_edit_player_subscription",
    form: sharedModalFormTmpl({
                                member_image:`<br/><br/>`,
                                cover: sharedModal_cover_Tmpl({title:"Manage Player Subscription",with_input:false}),
                                inputs: sharedModal_generateFields([
                                            // { id:'sharedModal_player_id', type: 'hidden', name: 'player_id', label: "Name", placeholder: "Enter Player Name", required: true },
                                            // { id:'sharedModal_mobile', type: 'mobile', name: 'mobile', label: 'Mobile', placeholder: "Enter Player Mobile Number", autocomplete:"new-mobile", required: true },
                                            { id:'sharedModal_Subscrip_plan' ,type: 'select', name: 'plan_id', label: 'Plan', placeholder: 'Select Plan', required: true},
                                            [
                                                { id:'sharedModal_from_date', type: 'text', name: 'from_date', label: "From Date", placeholder: "Enter Start Date",hidden:true},
                                                { id:'sharedModal_to_date', type: 'text', name: 'to_date', label: "To Date", placeholder: "Enter End Date",hidden:true},

                                            ],
                                            
                                        ])
                            }),
    befor_post:(formData) => {
        
        return true;
    },
    onSave: (data) => {  
        console.log(data) 
        document.activeElement.blur();
        $("#sharedModal").modal("hide");
        window.location.reload()
    },
    onShowModal: () => {
        set_select2_elm('Select Plan ', '/ajax/select2/subscription_plan_select2' ,'#sharedModal_Subscrip_plan', { closeOnSelect: true, dropdownParent: '#sharedModal' });
        $("#sharedModal_from_date").datepicker({
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            minDate: 0,
            showAnim: "fadeIn",
            onSelect: function(selectedDate) {
                console.log("Selected from_date:", selectedDate);
        
                let fromDate = $.datepicker.parseDate("yy-mm-dd", selectedDate);
                console.log("Parsed:", fromDate);
        
                // الحد الأدنى لتاريخ النهاية +1 يوم
                let minToDate = new Date(fromDate);
                minToDate.setDate(minToDate.getDate() + 1);
                $("#sharedModal_to_date").datepicker("option", "minDate", minToDate);
                
                // تاريخ النهاية بعد 30 يوم
                let autoToDate = new Date(fromDate);
                autoToDate.setDate(autoToDate.getDate() + 30);
        
                let formattedToDate = $.datepicker.formatDate("yy-mm-dd", autoToDate);
                console.log("Auto set to_date:", formattedToDate);
        
                $("#sharedModal_to_date").datepicker("setDate", formattedToDate);
            }
        });
        
        $("#sharedModal_to_date").datepicker({
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            minDate: 1,
            showAnim: "fadeIn"
        });
        $(document).on('change', '#sharedModal_Subscrip_plan', function(e) {
            var plan_id = $(this).val();
            if(plan_id){
                $("#sharedModal_to_date").closest(".sharedModal_hidden").show();
                $("#sharedModal_to_date").attr("required","")
                $("#sharedModal_to_date").datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    minDate: 1,
                    showAnim: "fadeIn"    
                });
                $("#sharedModal_from_date").closest(".sharedModal_hidden").show();
                $("#sharedModal_from_date").attr("required","")
                $("#sharedModal_from_date").datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    minDate: 0,
                    showAnim: "fadeIn",
                    onSelect: function(selectedDate) {
                        console.log(selectedDate)
                        let fromDate = $.datepicker.parseDate("yy-mm-dd", selectedDate);
                        console.log(fromDate)
                        let minToDate = new Date(selectedDate);
                        minToDate.setDate(minToDate.getDate() + 1);
                        $("#sharedModal_to_date").datepicker("option", "minDate", minToDate);
                        
                        // تحديد تاريخ النهاية بعد 30 يوم
                        let autoToDate = new Date(fromDate);
                        autoToDate.setDate(autoToDate.getDate() + 30);

                        let formattedToDate = $.datepicker.formatDate("yy-mm-dd", autoToDate);
                        console.log(formattedToDate)
                        $("#sharedModal_to_date").datepicker("setDate", formattedToDate);
                    }    
                });


                

            }else{
                
                $("#sharedModal_from_date").val("")
                $("#sharedModal_from_date").closest(".sharedModal_hidden").hide();
                $("#sharedModal_from_date").removeAttr("required")
                $("#sharedModal_to_date").val("")
                $("#sharedModal_to_date").closest(".sharedModal_hidden").hide();
                $("#sharedModal_to_date").removeAttr("required")
            }
        })
    }
};


$(document).on("click",".add_player_btn",function(e){
    openDynamicModal({ type: 'player', mode: 'add' });
})



$(document).on("click",".manage_player_subscription",function(e){
    player_id = $(this).data('player_id');
    player_name = $(this).data('player_name');
    if(player_id){
        
        openDynamicModal({ type: 'player_subscription', mode: 'edit', data: {id:player_id,type:'Subsciption',name:player_name}});
    }
})

$("#admin_players_table").DataTable({

});
$(document).on("click",".end_player_subscription",function(e){
    subscription_id = $(this).data('subscription_id');
    
    if(subscription_id){

        show_app_loader()
        var formData = new FormData()
        formData.append('subscription_id',subscription_id);
        $.ajax({
                type: "POST",
                url: "/ajax/end_player_subscription",
                data: formData,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function( data ){
                    hide_app_loader()
                    if(data.status === 'success') {
                        console.log('Session started:', data.session_id);
                        window.location.reload()
                    }else{
                        showError("Error", data.message);
                    }
                },
                error: function( jqXhr, textStatus, errorThrown ){
                    hide_app_loader()
                    showError("error",errorThrown)
                    console.log("error",errorThrown);
                }
        });

    }


})
