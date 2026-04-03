
const result_branches_line = ({ location,name,logo, num, b, f, id }) =>
`
<a target=”_blank” href="/branch/page/${id}"
    class="dropdown-item notify-item py-2">
    <div class="d-flex">
        <img src="${logo}" class="me-3 rounded-circle avatar-xs" alt="user-pic"/>
        <div class="flex-1">
            <h6 class="m-0">${name}</h6>
            <span class="fs-11 mb-0 text-muted">${location}</span>
        </div>
    </div>
</a>
`
const result_staff_line = ({ user_id, logo,role,name, mobile, b, f, id }) =>
`
<a target=”_blank” href="/staff/profile/${id}"
    class="dropdown-item notify-item py-2">
    <div class="d-flex">
        <img src="${logo}" class="me-3 rounded-circle avatar-xs" alt="user-pic"/>
        <div class="flex-1">
            <h6 class="m-0">${name}</h6>
            <span class="fs-11 mb-0 text-muted">${role}</span>
            <br/>
            <span class="fs-11 mb-0 text-muted">${mobile}</span>
        </div>
    </div>
</a>
`
const result_patient_line = ({ role,name,logo, mobile, b, f, id }) =>
`
<a target=”_blank” href="/patient/profile/${id}"
    class="dropdown-item notify-item py-2">
    <div class="d-flex">
        <img src="${logo}" class="me-3 rounded-circle avatar-xs" alt="user-pic"/>
        <div class="flex-1">
            <h6 class="m-0">${name}</h6>
            <span class="fs-11 mb-0 text-muted">${role}</span>
            <br/>
            <span class="fs-11 mb-0 text-muted">${mobile}</span>
        </div>
    </div>
</a>
`



$(document).on('keyup', '#search-options', function () {
    var term = $(this).val()
    $(".general_search_branches_list").empty()
    $(".general_search_staff_list").empty()
    $(".general_search_patient_list").empty()
    $('.general_search_branches_header').hide()
    $('.general_search_staff_header').hide()
    // $('.general_search_patient_header').hide()
    formData = new FormData();

    formData.append('term', term);

    $.ajax({
        type: 'POST',
        url: '/ajax/clinic_general_search',
        data: formData,
        dataType: 'json',
        processData: false,
        contentType: false,
        error: function (jqXHR, textStatus, errorMessage) {
            console.log(errorMessage)
        },
        success: function (data) {

            
            

            if (data.branches.length > 0) {
                $('.general_search_branches_header').show()
            }
            if (data.staff.length > 0) {
                $('.general_search_staff_header').show()
            }
            
                // $('.general_search_patient_header').show()
            
            
            
            data.branches.forEach(function (value) {
                $('.general_search_branches_list').append(result_branches_line({ 
                                                                                logo: value.logo,
                                                                                name: value.name,
                                                                                location: value.location, 
                                                                                num: value.num, 
                                                                                b: value.b, 
                                                                                f: value.f, 
                                                                                id: value.id 
                                                                            }))

            })
            data.staff.forEach(function (value) {
                $('.general_search_staff_list').append(result_staff_line({ 
                                                                            role: value.role, 
                                                                            user_id: value.user_id , 
                                                                            logo: value.logo,
                                                                            name: value.name, 
                                                                            mobile: value.mobile, 
                                                                            b: value.b, 
                                                                            f: value.f, 
                                                                            id: value.id 
                                                                        }))

            })
            data.patient.forEach(function (value) {
                $('.general_search_patient_list').append(result_patient_line({ 
                                                                                role: value.role,                                                                                logo: value.logo,
                                                                                name: value.name, 
                                                                                mobile: value.mobile, 
                                                                                b: value.b, 
                                                                                f: value.f, 
                                                                                id: value.id  
                                                                            
                                                                            }))


            })
            $('.general_search_patient_list').append(
                `
                    <a data-bs-toggle="modal" data-bs-target="#addPatientmemberModal" href="#"
                        class="dropdown-item notify-item py-2">
                        <div class="d-flex">
                            <img src="/fg_addon/static/modern/assets/images/users/user-dummy-img.jpg" class="me-3 rounded-circle avatar-xs" alt="user-pic"/>
                            <div class="flex-1">
                                <h6 class="m-0"></h6>
                                <span class="fs-11 mb-0 text-muted">Add New Patient</span>
                                <br/>
                                <span class="fs-11 mb-0 text-muted">For ${term}</span>
                            </div>
                        </div>
                    </a>

                
                `
            )



        }
    })






})