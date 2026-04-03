
function UpdateBackendStep(wizzard_id,current_step,next_step) {

    // alert("wizzard_id : " + wizzard_id + " > current_step : " + current_step + " > next_step : " + next_step)

    var formData = new FormData()
    formData.append('wizzard_id', wizzard_id)
    formData.append('current_step', current_step)
    formData.append('next_step', next_step)


    $.ajax({
        type: 'POST',
        url: '/ajax/update_wizzard_step',
        data: formData,
        dataType: 'json',
        processData: false,
        contentType: false,
        error: function (jqXHR, textStatus, errorMessage) {
            console.log(errorMessage);
        },
        success: function (data) {
            
                console.log(data);
                console.log(odoo);
            
        }
    });




}