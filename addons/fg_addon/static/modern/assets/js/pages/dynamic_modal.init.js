window.modalConfigs = window.modalConfigs || {};
window.modalBackConfigs = window.modalBackConfigs || {};
window.modalCallbacks = window.modalCallbacks || {};  // كل callback ممكن يبقى array of functions

function registerModalCallback(name, fn) {
    if (!window.modalCallbacks[name]) window.modalCallbacks[name] = [];
    window.modalCallbacks[name].push(fn);
}

async function loadModalConfig(modalType) {
    const response = await fetch(`/ajax/get_dynamic_modal_config/${modalType}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    });
    const config = await response.json();
    return config;
}


async function openDynamicModal({ type, mode = "add", data = null, callbackAction = null } = {}) {
    
    // let demo_config = await loadModalConfig(type);
    // console.log(demo_config)
    


    let config = window.modalConfigs[type];

    
    
    if (!config) {
        console.error("Config not found for type:", type);
        return;
    }
    
    $("#sharedModal .modal-body").html(config.form);
    $(`#sharedModal [name='mode']`).val(mode);

    // لو تعديل → نملأ القيم
    if (mode === "edit" && data) {
        $("#sharedModal_password").removeAttr("required")
        $("#sharedModal_branches").removeAttr("required")
        for (let key in data) {
            $(`#sharedModal [name='${key}']`).val(data[key]);
        }
        $(`#sharedModalLabel`).text(`Edit ${data.name} ${data.type} `);
        $(`#sharedModalSaveBtn`).text("Save Changes");
        
        if (data.coverImg) {
            $("#sharedModal_cover_img").attr("src", data.coverImg);
        }
        if (data.memberImg) {
            $("#sharedModal_member_img").attr("src", data.memberImg);
        }

    }
    
    $("#sharedModalForm").off("submit").on("submit", function(e) {
        e.preventDefault(); 
        var formData = new FormData($("#sharedModalForm")[0])
        if (mode === "edit" && data){
            formData.append("rec_id",data.id)
        }
        show_app_loader()
        if (typeof config.befor_post === "function") {
            
            if (config.befor_post(formData)){
                $.ajax({
                    type: 'POST',
                    url: config.form_post_url,
                    data: formData,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    error: function (jqXHR, textStatus, errorMessage) {
                        hide_app_loader()  
                        console.log(errorMessage);
                    },
                    success: function (res_data) {
                            hide_app_loader()  
                            if(res_data.error){
                                Swal.fire(
                                    {title:"Oops...",
                                    text:res_data.error,
                                    icon:"error",
                                    confirmButtonClass:"btn btn-primary",
                                    buttonsStyling:1,
                                    showCloseButton:!0}
                                )
                                return false;
                            }
                            if (typeof config.onSave === "function") {
                                config.onSave(res_data); 
                                document.activeElement.blur();
                                $("#sharedModal").modal("hide");
                            }
                            if (callbackAction && window.modalCallbacks[callbackAction]) {
                                window.modalCallbacks[callbackAction].forEach((cb, index) => {
                                    try {
                                        if (typeof cb === "function") {
                                            cb({
                                                config_data: data,
                                                config_type: type,
                                                mode: mode,
                                                res_data: res_data,
                                                index: index
                                            });
                                        }
                                    } catch (err) {
                                        console.error(`❌ Callback #${index} error:`, err);
                                    }
                                });
                            }
                        
                    }
                });
                
            }else{
                return false;
            
            }

            
            
            
        }
        

        
    });

    if (typeof config.onShowModal === "function") {
            config.onShowModal(mode,data); 
    }

    $("#sharedModal").modal("show");
    
    
}


$(document).on("change","#sharedModal_member_image_input" , function(o) {
            
            var e = $("#sharedModal_member_img"),
                t = $(this)[0].files[0],
                r = new FileReader;
            r.onload = function() {
                e.attr("src", r.result);
            };
            t && r.readAsDataURL(t);
});

$(document).on("change", "#sharedModal_cover_image_input",function(o) {
    var e = $("#sharedModal_cover_img"),
        t = $(this)[0].files[0],
        r = new FileReader;
    r.onload = function() {
        e.attr("src", r.result);
    };
    t && r.readAsDataURL(t);
});

$(document).on("keypress", "#sharedModal_mobile", function (e) {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
});

$(document).on("paste", "#sharedModal_mobile", function(e) {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
});

function layout_check_whats_number(number, callback) {
    show_app_loader();
    var formData = new FormData();
    formData.append("number", number);
    
    $.ajax({
        type: 'POST',
        url: '/ajax/layout_check_whats_number',
        data: formData,
        dataType: 'json',
        processData: false,
        contentType: false,
        error: function (jqXHR, textStatus, errorMessage) {
            hide_app_loader();
            console.log(errorMessage);
            callback(false);
        },
        success: function (res_data) {
            hide_app_loader();
            
            if(res_data.resp.canReceive){
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}


$(document).on("input", "#sharedModal_mobile", function (e) {
    
    code = $("#sharedModal_mobile_code").data("code")
    number = $(this).val()
    const phone = parsePhoneNumberFromString(number, code);
    
    if (phone && phone.isValid() ) {
        if (phone.getType() == "MOBILE"){
            wa_id = phone.number.replace('+', '')
            // wa_id = phone.number
            layout_check_whats_number(phone.number, function(result) {
                
                
                if(result) {
                    
                    $(this).css("border", "1px solid green").removeClass("not_valid");
                } else {
                    Swal.fire(
                        {title:"Oops...",
                        text:"This Number is correct but not whatsapp number",
                        icon:"error",
                        buttonsStyling:1,
                        showCloseButton:!0}
                    )
                    $(this).css("border", "1px solid red").addClass("not_valid");
                }
            }.bind(this));
            
            $("#sharedModal_final_mobile").val(wa_id)
            $(this).css("border", "1px solid green").removeClass("not_valid");

        }else{
            console.log(phone.getType())
            $(this).css("border", "1px solid red").addClass("not_valid");
        }
        
    }else{
        $(this).css("border", "1px solid red").addClass("not_valid");
    }

})
$(document).on("click",".sharedModal_mobile_code_item",function(){


        
        $("#sharedModal_mobile_img").attr("src",$(this).data("flag"))
        $("#sharedModal_mobile_code").attr("data-code",$(this).data("code"))


})



// $(document).on("keypress", "#sharedModal_mobile", function (e) {
//     if (!/[0-9]/.test(e.key)) e.preventDefault();
// });

// $(document).on("paste", "#sharedModal_mobile", function(e) {
//     if (!/[0-9]/.test(e.key)) e.preventDefault();
// });


    
    
// $(document).on("input", "#sharedModal_mobile", function () {
//     let val = $(this).val();
//     let isValid = false;
//     for (let code in shared_countries) {
//         let expectedLength = code.length + shared_countries[code];
//         if (val.startsWith(code) && val.length === expectedLength) {
//             isValid = true;
//             break;
//         }
//     }

//     if (isValid) {
//         $(this).css("border", "1px solid green").removeClass("not_valid");
//     } else {
//         $(this).css("border", "1px solid red").addClass("not_valid");
//     }
// });
