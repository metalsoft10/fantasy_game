var userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let countries = odoo.company.country_list || [];
let currentCountry = countries.find(c => c.current)
const { parsePhoneNumberFromString } = libphonenumber;

$(document).on("click",".js_send_portal_msg",function(e){
    var msg_to = $(this).data("user_id")
    window.location.replace(`/support?msg_to=${msg_to}`)
})

$(document).ready(function() {
    $('[data-key_t]').each(function() {
        const key = $(this).data('key_t');
        
        if (TRANSLATIONS[key]) {
            $(this).text(TRANSLATIONS[key]);
        } else {
            // console.warn('⚠️ Missing translation for key:', key);
        }
    });
});

const patient_list_content = ({r, branche_cover, i}) =>
`
    <div class="col">            
        <div class="card team-box">                
            <div class="team-cover">                    
                <img src="${branche_cover}" alt="" class="img-fluid" />                
            </div>                
            <div class="card-body p-4">                    
                <div class="row align-items-center team-row">                        
                    <div class="col team-settings">                            
                        <div class="row">                                
                            <div class="col">                                    
                                <div class="flex-shrink-0 me-2">                                                                          
                                </div>                                
                            </div>                                
                            <div class="col text-end dropdown">                                    
                                <a href="javascript:void(0);" data-bs-toggle="dropdown" aria-expanded="false">                                        
                                    <i class="ri-more-fill fs-17"></i>                                    
                                </a>                                    
                                <ul class="dropdown-menu dropdown-menu-end">                                        
                                    <li>
                                        <a class="dropdown-item edit-list" href="javascript:void(0);" data-edit_id="${r.id}" data-patient_json='${JSON.stringify(r)}'>
                                            <i class="ri-pencil-line me-2 align-bottom text-muted"></i>Edit
                                        </a>
                                    </li>

                                </ul>                                
                            </div>                            
                        </div>                        
                    </div>                        
                    <div class="col-lg-4 col">                            
                        <div class="team-profile-img">                                
                            <div class="avatar-lg img-thumbnail rounded-circle flex-shrink-0">${i}</div>                                
                            <div class="team-content">                                    
                                <a class="member-name" data-bs-toggle="offcanvas" href="#member-overview" aria-controls="member-overview">                                        
                                    <h5 class="fs-16 mb-1">${r.memberName}</h5>                                    
                                </a>                                    
                                                            
                                <p class="text-muted member-role mb-0">${r.role}</p>  
                                <p class="text-muted member-designation mb-0">${r.mobile}</p>                               
                            </div>                            
                        </div>                        
                    </div>                        
                    <div class="col-lg-4 col">                            
                        <div class="row text-muted text-center patient_extra_option" id="patient_extra_option_${r.id}" data-member_json='${JSON.stringify(r)}'>                                
                            
                            <div class="col-4 border-end border-end-dashed">                                    
                                <h5 class="mb-1 projects-num">${r.projects}</h5>                                    
                                <p class="text-muted mb-0">${_js_translate('project')}</p>                                
                            </div>                                
                            <div class="col-4">                                    
                                <h5 class="mb-1 tasks-num">${r.tasks}</h5>                                    
                                <p class="text-muted mb-0">Tasks</p>                                
                            </div> 
                                                        
                        </div>                        
                    </div>                        
                    <div class="col-lg-2 col">                            
                        <div class="text-end">                                                            
                        </div>                        
                    </div>                    
                </div>                
            </div>            
        </div>        
    </div>
`
const FieldGenerator = {

    note : (config) =>`

        <div class="mb-4 ${config.hidden ? 'sharedModal_hidden' : ''}" id="${config.id}_div" style="display: none;">
            <div class="alert alert-danger" role="alert">
                <strong> ${config.label} </strong> 
                <br/>
                ${config.placeholder},
            </div>
        </div>
    
    `,
    text: (config) => `
        <div class="mb-3 ${config.hidden ? 'sharedModal_hidden' : ''}" id="${config.id}_div">
            <label for="${config.id}" class="form-label">${config.label}</label>
            <input type="text" class="form-control" id="${config.id}" name="${config.name}" 
                   placeholder="${config.placeholder || ''}" 
                   ${config.required ? 'required' : ''} autocomplete="${config.autocomplete || config.id}" />
            <div class="invalid-feedback">${config.error || 'Required field'}</div>
        </div>
        
    `,
    mobile: (config) => {
        
        return `
        <div class="mb-3 ${config.hidden ? 'sharedModal_hidden' : ''}" id="${config.id}_div">
            <label for="${config.id}" class="form-label">${config.label}</label>
            <div class="input-group" data-input-flag>
                
                <button class="btn btn-light border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="${currentCountry.flag}" height="20" id="sharedModal_mobile_img" class="country-flagimg rounded">
                    <span class="ms-2 country-codeno" id="sharedModal_mobile_code" data-code="${currentCountry.code}">
                        
                    </span>
                </button>
                
                <input type="text" class="form-control rounded-end flag-input" id="${config.id}"  placeholder="${config.placeholder || ''}" ${config.required ? 'required' : ''} autocomplete="${config.autocomplete || ''}"/>
                <input type="hidden" id="sharedModal_final_mobile" name="${config.name}" />
                <div class="dropdown-menu w-100">
                    <div class="p-2 px-3 pt-1 searchlist-input">
                        <input type="text" class="form-control form-control-sm border search-countryList" placeholder="Search country name or country code..." />
                        
                    </div>
                    <ul class="list-unstyled dropdown-menu-list mb-0">
                        ${countries.map(c => `
                            <li>
                            <a class="dropdown-item sharedModal_mobile_code_item" href="#"
                                data-code="${c.code}"
                                data-dial="${c.dial}"
                                data-flag="${c.flag}">
                                ${c.name}
                            </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
        
    `},
    
    email: (config) => `
        <div class="mb-3 ${config.hidden ? 'sharedModal_hidden' : ''}" id="${config.id}_div">
            <label for="${config.id}" class="form-label">${config.label}</label>
            <input type="email" class="form-control" id="${config.id}" name="${config.name}" 
                   placeholder="${config.placeholder || ''}" 
                   ${config.required ? 'required' : ''} autocomplete="${config.autocomplete || ''}"/>
            <div class="invalid-feedback">${config.error || 'Invalid email'}</div>
        </div>
    `,
    
    password: (config) => `
        <div class="mb-3 ${config.hidden ? 'sharedModal_hidden' : ''}" id="${config.id}_div">
            <label for="${config.id}" class="form-label">${config.label}</label>
            <input type="password" class="form-control" id="${config.id}" name="${config.name}" 
                   placeholder="${config.placeholder || ''}" 
                   ${config.required ? 'required' : ''} autocomplete="${config.autocomplete || ''}"/>
            <div class="invalid-feedback">${config.error || 'Required field'}</div>
        </div>
    `,
    
    select: (config) => `
        <div class="mb-3 ${config.hidden ? 'sharedModal_hidden' : ''}" id="${config.id}_div">
            <label for="${config.id}" class="form-label">${config.label}</label>
            <select class="form-select" id="${config.id}" name="${config.name}" 
                    ${config.multiple ? 'multiple' : ''} 
                    ${config.required ? 'required' : ''}>
                <option value="">Select ${config.label}</option>
                ${config.options ? config.options.map(opt => 
                    `<option value="${opt.value}">${opt.text}</option>`
                ).join('') : ''}
            </select>
            <div class="invalid-feedback">${config.error || 'Required field'}</div>
        </div>
    `,
    
    row: (fields) => `
        <div class="row">
            ${fields.map(f => `<div class="col-md-${12/fields.length}">${f}</div>`).join('')}
        </div>
    `
};

function sharedModal_generateFields(fields) {
    return fields.map(field => {
        if (Array.isArray(field)) {
            // Row of fields
            return FieldGenerator.row(field.map(f => FieldGenerator[f.type](f)));
        }
        return FieldGenerator[field.type](field);
    }).join('');
}
const sharedModal_cover_Tmpl = ({src = '/fg_addon/static/modern/assets/images/small/img-9.jpg',title,with_input}) =>
`
    <div class="modal-team-cover position-relative mb-0 mt-n4 mx-n4 rounded-top overflow-hidden">
        <img src="${src}" alt="" id="sharedModal_cover_img" class="img-fluid"></img>

        <div class="d-flex position-absolute start-0 end-0 top-0 p-3">
            <div class="flex-grow-1">
                <h5 class="modal-title text-white" id="sharedModalLabel"> ${title}</h5>
            </div>
            <div class="flex-shrink-0">
                <div class="d-flex gap-3 align-items-center">
                    <div>
                        <label ${with_input ? 'for="sharedModal_cover_image_input"' : ''} class="mb-0" data-bs-toggle="tooltip" data-bs-placement="top" title="Select Cover Image">
                            <div class="avatar-xs">
                                ${with_input ? `
                                    <div class="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                                        <i class="ri-image-fill"></i>
                                    </div>
                                    ` : ''
                                }
                                
                            </div>
                        </label>
                        <input class="form-control d-none" value="" id="sharedModal_cover_image_input" ${with_input ? 'name="cover"' : ''} type="file" accept="image/png, image/gif, image/jpeg"/>
                    </div>
                    <button type="button" class="btn-close btn-close-white"  id="createMemberBtn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
            </div>
        </div>
    </div>
`
const sharedModal_member_image_tmpl = ({src = '/fg_addon/static/modern/assets/images/users/user-dummy-img.jpg',name='logo'}) =>
`
    <div class="position-relative d-inline-block">
        <div class="position-absolute bottom-0 end-0">
            <label for="sharedModal_member_image_input" class="mb-0" data-bs-toggle="tooltip" data-bs-placement="right" title="Select Member Image">
                <div class="avatar-xs">
                    <div class="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                        <i class="ri-image-fill"></i>
                    </div>
                </div>
            </label>
            <input class="form-control d-none"  name="${name}" id="sharedModal_member_image_input" type="file" accept="image/png, image/gif, image/jpeg"/>
        </div>
        <div class="avatar-lg">
            <div class="avatar-title bg-light rounded-circle">
                <img src="${src}" id="sharedModal_member_img" class="avatar-md rounded-circle h-auto" />
            </div>
        </div>
    </div>
`


const sharedModalFormTmpl = ({member_image,cover,inputs}) =>
`
        
        <form autocomplete="off" id="sharedModalForm" >
            <div class="row">
                <div class="col-lg-12">
                    <input type="hidden" id="sharedModal_id_input" class="form-control" name="id" />
                    <input type="hidden" id="sharedModal_mode_input" class="form-control" name="mode" value="add"/>
                    <div class="px-1 pt-1">
                        ${cover}
                        
                    </div>
                    <div class="text-center mb-4 mt-n5 pt-2">
                        ${member_image}
                        
                    </div>
                    
                    ${inputs}
                    
                    
                    
                    

                    <div class="hstack gap-2 justify-content-end">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-success" id="sharedModalSaveBtn">Save</button>
                        
                    </div>
                </div>
            </div>
        </form>

`


set_select2_elm('Select Country ', '/ajax/select2/wizzard_country_select2' ,'.wizzard_country_select2', { closeOnSelect: true });
set_select2_elm('Select currency ', '/ajax/select2/wizzard_currency_select2' ,'.wizzard_currency_select2', { closeOnSelect: true });

// callHelper('get_max_spis').then(res => {
//         var max_spis = 0 
//         max_spis = res.result.data;
//         set_select2_elm('Select Specialization ', '/ajax/select2/wizzard_specialization_select2' ,'.wizzard_specialization_select2', { closeOnSelect: true , maximumSelectionLength: max_spis});

// })




function show_app_loader(){

    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0.4';
    preloader.style.visibility = 'visible';

}
function hide_app_loader(){
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '1';
    preloader.style.visibility = 'hidden'; 
}
function showError(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: "error",
        customClass: {
            confirmButton: "btn btn-success"
        },
        buttonsStyling: true,
        showCloseButton: true
    });
}
function callHelper(method, params = null) {
    return $.ajax({
        url: '/ajax/system/helper',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                method: method,
                params: params
            }
        })
    });
}
function _js_translate(key){
    if (TRANSLATIONS[key]) {
        return TRANSLATIONS[key]
    }else{
        console.warn('⚠️ Missing translation for key:', key);
        return key
    }
}

function MedicalBaseReloadTranslate(){
        show_app_loader()
        var formData = new FormData()

        $.ajax({
            type: 'POST',
            url: '/ajax/hospital_reload_translate',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            error: function (jqXHR, textStatus, errorMessage) {
                hide_app_loader() 
                console.log(errorMessage);
            },
            success: function (data) {

                hide_app_loader() 
                window.location.reload()
            }
        })
}
function MedicalBaseSwitchLang(lang){
        show_app_loader()
        var formData = new FormData()
        formData.append("lang",lang)

        $.ajax({
            type: 'POST',
            url: '/ajax/hospital_switch_lang',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            error: function (jqXHR, textStatus, errorMessage) {
                hide_app_loader() 
                console.log(errorMessage);
            },
            success: function (data) {
                hide_app_loader() 
                if(data.res){
                    window.location.reload()
                }
            }
        })
}
function update_sharedModal_mobile_input(){

        // show_app_loader()
        var formData = new FormData()
        $.ajax({
            type: 'POST',
            url: '/ajax/get_current_cuountry_data',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            error: function (jqXHR, textStatus, errorMessage) {
                // hide_app_loader() 
                console.log(errorMessage);
            },
            success: function (data) {
                // hide_app_loader() 
                if(data.res){
                    console.log(data.res)
                    
                    $("#sharedModal_mobile_img").attr("src",data.res.flag)
                    $("#sharedModal_mobile_code").attr("data-code",data.res.code)
                    
                }
            }
        })


}