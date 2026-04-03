$(document).on("change","#wizzard_company_image_input" , function(o) {
            
            var e = $("#wizzard_member_img"),
                t = $(this)[0].files[0],
                r = new FileReader;
            r.onload = function() {
                e.attr("src", r.result);
            };
            t && r.readAsDataURL(t);
});

$(function () {
    var wizzard_id = $('.vertical-navs-step').attr('data-wizzard_id')
    
    $(".form-steps").each(function () {
        const form = $(this);
        
        const navButtons = form.find('button[data-bs-toggle="pill"]');
        


        // --- دوال مساعدة ---
        const setProgress = (index) => {
            const total = navButtons.length - 1;
            const percent = (index / total) * 100;
            $("#custom-progress-bar .progress-bar").css("width", percent + "%");
        };

        const updateSteps = (currentIndex) => {
            navButtons.removeClass("done").each(function (i) {
                if (i < currentIndex) $(this).addClass("done");
            });
        };

        const validateInputs = () => {
            let valid = true;
            const inputs = form.find(".tab-pane.show .form-control");

            inputs.each(function () {
                const value = $(this).val().trim();
                const required = $(this).prop("required");

                // قواعد تحقق متقدمة
                if (required && !value) valid = false;
                if ($(this).attr("type") === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) valid = false;
                if ($(this).attr("type") === "text" && value.length < 2) valid = false;
            });

            if (!valid) form.addClass("was-validated");
            return valid;
        };

        // --- أحداث ---
        form.on("click", ".nexttab", function () {
            if (!validateInputs()) return;
            $("#" + $(this).data("nexttab")).trigger("click");
            
            var current_step = $(this).data("current_step")
            var next_step = $(this).data("next_step")

            var data = {}

            if (current_step == 1){
                data = {
                    "step" : "1",
                    "logo" : $("#wizzard_company_image_input")[0].files[0],
                    "company_name" : $("#company_name").val(),
                    "country" : $("#country").val(),
                    "currency" : $("#currency").val(),
                    "password" : $("#admin_password").val(),
                    "specialization": JSON.stringify($("#specialization").val()) 
                }
                


            }

            send_step_data(data,wizzard_id,current_step,next_step)

            

            
            
        });

        form.on("click", ".previestab", function () {
            form.find(".custom-nav .done").last().removeClass("done");
            $("#" + $(this).data("previous")).trigger("click");
        });

        navButtons.each((i, btn) => $(btn).attr("data-position", i));
        navButtons.on("click", function () {
            const index = $(this).data("position");
            form.removeClass("was-validated");

            if ($(this).data("progressbar")) setProgress(index);
            updateSteps(index);
        });
    });
});

function send_step_data(data,wizzard_id,current_step,next_step){
    console.log(data)

    var formData = new FormData()
    
    $.each(data, function(key, value) {
        formData.append(key, value)
    })

    $.ajax({
        type: 'POST',
        url: '/ajax/update_dashboard_wizzard_step',
        data: formData,
        dataType: 'json',
        processData: false,
        contentType: false,
        error: function (jqXHR, textStatus, errorMessage) {
            console.log(errorMessage);
        },
        success: function (data) {
                
                UpdateBackendStep(wizzard_id,current_step,next_step)
                console.log("Updata Odoo Data Here")
                odoo.company.country_id = parseInt(data.kw.country)
                odoo.company.country_name = data.kw.country_name
                currentCountry = {code:"AL",flag:"/base/static/img/country_flags/al.png"}
                console.log(data);
                
            
        }
    });

}