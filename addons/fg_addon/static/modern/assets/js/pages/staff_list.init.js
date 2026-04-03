window.modalConfigs["staff"] = {
    form_post_url:"/ajax/add_staff_user",
    form: sharedModalFormTmpl({
                                member_image:sharedModal_member_image_tmpl({name:"image_1920"}),
                                cover: sharedModal_cover_Tmpl({title:_js_translate('sharedModal_staff_title'),with_input:true}),
                                inputs: sharedModal_generateFields([
                                                                    { id:'sharedModal_name', type: 'text', name: 'name', label: _js_translate('sharedModal_name_input'), placeholder: _js_translate('sharedModal_name_placeholder'), required: true },
                                                                    [
                                                                        { id:'sharedModal_mobile', type: 'mobile', name: 'mobile', label: _js_translate('sharedModal_mobile_input'), placeholder: _js_translate('sharedModal_mobile_placeholder'), autocomplete:"new-mobile", required: true,_currentCountry:currentCountry},
                                                                        { id:'sharedModal_password', type: 'password', name: 'password', label: _js_translate('sharedModal_password_input'), placeholder: _js_translate('sharedModal_password_placeholder'),autocomplete:"new-password", required: true },

                                                                    ],
                                                                    { id:'sharedModal_email', type: 'email', name: 'email', label: _js_translate('sharedModal_email_input'), placeholder: _js_translate('sharedModal_email_placeholder'), autocomplete:"new-email", required: true },
                                                                    { id:'sharedModal_branches', type: 'select', name: 'branches', label: 'Branches', required: true, multiple:true },
                                                                    { id:'branches_div_msg', type: 'note', label: 'Change Branche Is Not Allowed !', placeholder: "You don't have enough Privilage To Change This User Branches," },
                                                                    [
                                                                        { id:'sharedModal_title', type: 'text', name: 'title', label: 'Job Title', placeholder: 'Enter Job Title', required: true },
                                                                        { id:'sharedModal_role', type: 'select', name: 'role', label: 'Role', required: true , 
                                                                            options: [
                                                                                ...(odoo.user.role == "admin" ? [
                                                                                    { value: 'admin', text: 'Admin' },
                                                                                    { value: 'manager', text: 'Clinic Manager' },
                                                                                ] : []),
                                                                                { value: 'receptionist', text: 'Receptionist' },
                                                                                { value: 'doctor', text: 'Doctor' },
                                                                                { value: 'nurse', text: 'Nurse' },
                                                                            ]
                                                                        },
                                                                    ]
                                                                ])
                            }),
    befor_post:(formData) => {
        var user_branches = formData.get('branches')
        if (user_branches){
            var user_selected_branches = $("#sharedModal_branches").val();
            if (user_selected_branches.length > 0){
                formData.append("usr_branch_count", user_selected_branches.length);
                $.each(user_selected_branches, function (index, value) {
                    formData.append("usr_branch_" + index + "_id", value);
                });

            }
        }else{
            showError("Oops...","You Should Select At Least One Branch!")
            return false;
        }
        if ($("#sharedModal_mobile").hasClass("not_valid")) {
            showError("Oops...","Mobile Number Not accepted!")
            return false;
        } 
        return true;
        
    },
    onSave: (data) => {
        document.activeElement.blur();
        $("#sharedModal").modal("hide");
    },
    onShowModal: (mode,data) => {
        console.log(mode)
        update_sharedModal_mobile_input()
        if(mode == "add"){
            set_select2_elm('Select Branches ', '/ajax/select2/wizzard_branche_select2' ,'#sharedModal_branches', { closeOnSelect: true, dropdownParent: '#sharedModal' });
            
        }
        if(mode == "edit"){
            if (data.edit_branch){
                
                var branches = data.branches
                $("#sharedModal_branches").empty();
                $.each(branches, function (index, value) {
                    $("#sharedModal_branches").append(`
                        <option selected="selected" value="${value.id}">${value.name}</option>
                    `)
                })
                $("#sharedModal_branches").select2({
                    dropdownParent: $('#sharedModal'),
                    placeholder: "Select Branches",
                    allowClear: true
                });
            }else{
            
                $("#branches_div_msg_div").show();  
                $("#sharedModal_branches_div").hide(); 
                $("#sharedModal_branches").removeAttr("name"); 
            }
            

        }
        
    }
}



registerModalCallback("staff_wizzard_form_callback", function({ config_data,config_type,mode,res_data,type}) {

    console.log(res_data);
    
    $("#startup_wizzard_staff_list").append(`
        <li t-foreach="staff" t-as="b" class="list-group-item disabled" aria-disabled="true">
            <div class="d-flex align-items-center">
                <div class="flex-shrink-0">

                    <img src="/ajax/staff/image/${res_data.user_id}/l" style="min-height: 64px; min-width: 64px; max-width: 64px; max-height: 64px;" alt="" class="rounded-circle"/>
                    
                </div>
                <div class="flex-grow-1 ms-2">
                    ${res_data.kw.name} | ${res_data.role}
                </div>
            </div>
        </li>

       
    `);
    if(res_data.role == "doctor"){

        
        window.open(`/staff/profile/${res_data.employee_id}/edit`, '_blank');

    }

    
});


window.tableConfigs["staff"] = {
    ajax_url:"/ajax/staff/list/dt",
    columns: [
        {
            data: "name",
            title: "Name",
            alwaysShow: true,
            type: "user",
            image_field: "memberImg"
        },
        {
            data: "mobile",
            title: "Mobile",
            visible: true
        },
        {
            data: "branches",
            title: "Branches",
            type: "array",
            array_field: "name",
            visible: true
        },
        {
            data: "created_at",
            title: "Created",
            type: "date",
            filterable: true,
            visible: true
        },
        {
            data: "role",
            title: "Role",
            visible: true
        },
        {
            data: "action",
            title: "Action",
            alwaysShow: true,
            orderable: false
        }
    ]
};

add_table({ type: "staff" });

if($('.medical_stuff_list').length > 0){

    var buttonGroups, list = $(".team-list");
    $('#branches').select2({
        dropdownParent: $('#addmemberModal'), // مهم عشان modal
        placeholder: "Select Branches",
        allowClear: true
    });
    function onButtonGroupClick(e) {
        if ($(e.target).attr("id") === "list-view-button" || $(e.target).parent().attr("id") === "list-view-button") {
            $("#list-view-button").addClass("active");
            $("#grid-view-button").removeClass("active");
            $(list).each(function() {
                $(this).addClass("list-view-filter").removeClass("grid-view-filter");
            });
        } else {
            $("#grid-view-button").addClass("active");
            $("#list-view-button").removeClass("active");
            $(list).each(function() {
                $(this).removeClass("list-view-filter").addClass("grid-view-filter");
            });
        }
    }

    if (list.length && (buttonGroups = $(".filter-button")).length) {
        $(buttonGroups).each(function() {
            $(this).on("click", onButtonGroupClick);
        });
    }



    function loadTeamData(e) {
        $("#team-member-list").html("");
        $(e).each(function(t, r) {
            

            var branche_cover = r.coverImg
                    
            if(r.coverImg == ""){
                branche_cover = "/fg_addon/static/modern/assets/images/small/img-12.jpg"
            }
                    
            var m = $(r).attr("bookmark") ? "active" : "",
                i = $(r).attr("memberImg") ? '<img src="' + $(r).attr("memberImg") + '" alt="" class="member-img img-fluid d-block rounded-circle" />' : '<div class="avatar-title border bg-light text-primary rounded-circle text-uppercase">' + $(r).attr("nickname") + "</div>";
            
            const member_list_content = () =>
                    `
                        <div class="col">            
                            <div class="card team-box ribbon-box border"> 
                                
                                        
                                        
                                            
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
                                                    <ul class="dropdown-menu dropdown-menu-end" id="user_dropdown_menu_${r.id}"> 
                                                         <li><a class="dropdown-item member-name" data-member_json='${JSON.stringify(r)}' data-employee_id="${r.id}" data-bs-toggle="offcanvas"  href="#member-overview" aria-controls="member-overview" data-bs-toggle="modal" data-edit-id="${r.id}"><i class="ri-pencil-line me-2 align-bottom text-muted"></i>Info</a></li>                                       
                                                                                                                                   
                                                    </ul>                                
                                                </div>                            
                                            </div>                        
                                        </div>                        
                                        <div class="col-lg-4 col">                            
                                            <div class="team-profile-img">                                
                                                <div class="avatar-lg img-thumbnail rounded-circle flex-shrink-0">${i}</div>                                
                                                <div class="team-content">                                    
                                                    <a class="member-name" data-member_json='${JSON.stringify(r)}' data-employee_id="${r.id}" data-bs-toggle="offcanvas" href="#member-overview" aria-controls="member-overview">                                        
                                                        <h5 class="fs-16 mb-1">${r.memberName}</h5>                                    
                                                    </a>
                                                    <table class="table w-100">
                                                        
                                                        <tr>
                                                            <td class="text-muted text-start"> Position : </td><td class="text-muted text-center member-designation" > ${r.position} </td>
                                                        </tr>
                                                        
                                                        <tr>
                                                            <td class="text-muted text-start"> Role : </td><td class="text-muted text-center member-designation" > ${r.role} </td>
                                                        </tr>
                                                        
                                                        <tr>
                                                            <td class="text-muted text-start"> Mobile : </td><td class="text-muted text-center member-designation" > ${r.mobile} </td>
                                                        </tr>
                                                        
                                                        <tr>
                                                            <td class="text-muted text-start"> Email : </td><td class="text-muted text-center member-designation" > ${r.email} </td>
                                                        </tr>
                                                        
                                                        
                                                    </table>                                    
                                                    
                                                    <div id="member_${r.id}_branches">
                                                        
                                                    </div>
                                                                                   
                                                </div>                            
                                            </div>                        
                                        </div>                        
                                        <div class="col-lg-4 col">                            
                                            <div class="row text-muted text-center">                                
                                                <div class="col-4">                                    
                                                    <h5 class="mb-1 projects-num">${r.projects}</h5>                                    
                                                    <p class="text-muted mb-0">Projects</p>                                
                                                </div>                                
                                                <div class="col-4">                                    
                                                    <h5 class="mb-1 tasks-num">${r.tasks}</h5>                                    
                                                    <p class="text-muted mb-0">Tasks</p>                                
                                                </div>
                                                <div class="col-4">                                    
                                                    <h5 class="mb-1 tasks-num">
                                                    
                                                    <i class="ri-question-answer-fill align-bottom ms-1 cursor-pointer js_send_portal_msg" data-user_id="${r.user_id}" ></i>
                                                    </h5>                                    
                                                    <p class="text-muted mb-0">Chat</p>                                
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
            $("#team-member-list").append(member_list_content);
            if(r.edit_user){
                $("#user_dropdown_menu_" + r.id).append(`
                    
                    <li><a class="dropdown-item edit-list"  href="/staff/profile/${r.id}/edit"><i class="ri-pencil-line me-2 align-bottom text-muted"></i>Edit</a></li>
                    <li><a class="dropdown-item" data-member_json='${JSON.stringify(r)}' onclick='openDynamicModal({ type: "staff", mode: "edit", data:${JSON.stringify(r)} })' data-edit-id="${r.id}"><i class="ri-pencil-line me-2 align-bottom text-muted"></i>Quick Edit</a></li>

                `)
            }
            $.each(r.branches, function (index, value) {
                $("#member_" + r.id + "_branches").append(`

                    <span class="badge bg-info">${value.name}</span>

                `)
            })

            bookmarkBtn();
            // editMemberList();
            removeItem();
            // memberDetailShow();
        });
    }

    function bookmarkBtn() {
        $(".favourite-btn").each(function() {
            $(this).on("click", function() {
                $(this).hasClass("active") ? $(this).removeClass("active") : $(this).addClass("active");
            });
        });
    }

    $.getJSON("/ajax/staff/list", function(e) {
        allmemberlist = e;
        loadTeamData(allmemberlist);
    }).fail(function(e) {
        console.error(e);
    });

    $(document).on("click", ".staff_fillter", function(e) {
        var fillter = $(this).data("fillter");
        if (fillter){

            $.getJSON(`/ajax/staff/list?fillter=${fillter}`, function(e) {
                allmemberlist = e;
                loadTeamData(allmemberlist);
            }).fail(function(e) {
                console.error(e);
            });
            $(".staff_filter_option").html(`<i class="ri-more-2-fill"></i> ${fillter}`)

        }else{

            $.getJSON("/ajax/staff/list", function(e) {
                allmemberlist = e;
                loadTeamData(allmemberlist);
            }).fail(function(e) {
                console.error(e);
            });
            $(".staff_filter_option").html(`<i class="ri-more-2-fill"></i> All`)

        }


    })

    bookmarkBtn();
    var editlist = !1;

    
    $(document).on("click", ".addMembers-modal", function(e){

            $("#createMemberLabel").html("Add New Members");
            $("#addNewMember").html("Add Member");
            $("#branches").val("").trigger("change");
            $("#role").val("");
            $("#email").val("");
            $("#mobile").val("");
            $("#teammembersName").val("");
            $("#designation").val("");
            $("#cover-img").attr("src", "/fg_addon/static/modern/assets/images/small/img-9.jpg");
            $("#member-img").attr("src", "/fg_addon/static/modern/assets/images/users/user-dummy-img.jpg");
            $("#user_password").attr("required", "required");
            $("#memberlist-form").removeClass("was-validated");
            $("#memberlist-form").addClass("create_member_form");
            $("#memberlist-form").removeClass("edit_member_form");
            $(".member_id_input").remove()


    })

    
    
    
    $(document).on("click", ".edit-list", function(e){
        var member_json = $(this).data("member_json");
        $(".member_id_input").remove()
        $("#createMemberLabel").html("Edit Member" + "  " + member_json.memberName);
        $("#addNewMember").html("Save");
        if (member_json.memberImg == "") {
            $("#member-img").attr("src", "/fg_addon/static/modern/assets/images/users/user-dummy-img.jpg");
        } else {
            $("#member-img").attr("src", member_json.memberImg);
        }
        if (member_json.coverImg == "") {
                $("#cover-img").attr("src", "/fg_addon/static/modern/assets/images/small/img-12.jpg");
        } else {
            $("#cover-img").attr("src", member_json.coverImg);
        }
        $("#memberid-input").val(member_json.id);
        $("#memberlist-form").append(`<input type="hidden" id="member_id_input" name="member_id_input" class="form-control member_id_input" value="${member_json.id}"/>`);
        $("#teammembersName").val(member_json.memberName);
        $("#designation").val(member_json.position);
        $("#branches").val("").trigger("change");
        if (member_json.edit_branch){
            var branches_list = [];
            $("#branches_div").show();
            $("#branches_div_msg").hide(); 
            $("#branches").attr("name", "branches");
            
            $.each(member_json.branches, function (index, value) {
                
                branches_list.push(value.id);
                
            })
            $("#branches").val(branches_list).trigger("change");
            

            
        }else{
            
            $("#branches_div_msg").show();  
            $("#branches_div").hide(); 
            $("#branches").removeAttr("name"); 
        }
        $("#user_password").removeAttr("required");
        $("#role").val(member_json.role);
        $("#email").val(member_json.email);
        $("#mobile").val(member_json.mobile);
        $("#project-input").val(member_json.projects);
        $("#task-input").val(member_json.tasks);
        $("#memberlist-form").removeClass("create_member_form");
        $("#memberlist-form").addClass("edit_member_form");

        
    })


    function fetchIdFromObj(e) {
        return parseInt(e.id);
    }

    function findNextId() {
        var e, t;
        if (allmemberlist.length === 0) return 0;
        e = fetchIdFromObj(allmemberlist[allmemberlist.length - 1]);
        t = fetchIdFromObj(allmemberlist[0]);
        return e <= t ? t + 1 : e + 1;
    }

    function sortElementsById() {
        loadTeamData(allmemberlist.sort(function(e, t) {
            e = fetchIdFromObj(e);
            t = fetchIdFromObj(t);
            return t < e ? -1 : e < t ? 1 : 0;
        }));
    }

    function removeItem() {
        var r;
        $(".remove-list").each(function() {
            $(this).on("click", function(e) {
                r = $(this).data("remove-id");
                $("#remove-item").on("click", function() {
                    var t = r;
                    allmemberlist = $.grep(allmemberlist, function(e) {
                        return e.id != t;
                    });
                    loadTeamData(allmemberlist);
                    $("#close-removeMemberModal").click();
                });
            });
        });
    }

    
    $(document).on("click", ".member-name", function(e){
            
            var member_json = $(this).data("member_json");

            // data() بيرجعه string، فلازم نعمله parse
            if (typeof member_json === "string") {
                member_json = JSON.parse(member_json);
            }
            var member_cover = member_json.coverImg
            var member_logo = member_json.memberImg
                    
            if(member_json.coverImg == ""){
                member_cover = "/fg_addon/static/modern/assets/images/small/img-12.jpg"
            }
            if(member_json.memberImg == ""){
                member_logo = "/fg_addon/static/modern/assets/images/users/user-dummy-img.jpg"
            }
            

            $("#member-overview .profile-name").html(member_json.memberName);
            $("#member-overview .profile-designation").html(member_json.position);
            $("#member-overview .profile-project").html(member_json.projects);
            $("#member-overview .profile-task").html(member_json.tasks);
            $("#member-overview .profile-img").attr("src", member_logo);
            $("#staff_details_view_profile").attr("href", `/staff/profile/${member_json.id}`);
            $("#staff_details_edit_profile").attr("href", `/staff/profile/${member_json.id}/edit`);

            $("#member-overview .team-cover img").attr("src",member_cover);


            // console.log(member_json);
    })

    $("#member-image-input").on("change", function() {
        var e = $("#member-img"),
            t = $(this)[0].files[0],
            r = new FileReader;
        r.onload = function() {
            e.attr("src", r.result);
        };
        t && r.readAsDataURL(t);
    });

    $("#cover-image-input").on("change", function() {
        var e = $("#cover-img"),
            t = $(this)[0].files[0],
            r = new FileReader;
        r.onload = function() {
            e.attr("src", r.result);
        };
        t && r.readAsDataURL(t);
    });

    

    (function() {
        "use strict";
        var e = $(".needs-validation");
        $.each(e, function(s, t) {
            $(t).on("submit", function(e) {
                var t, r, m, i, n, a, o, l;
                if (this.checkValidity()) {
                    e.preventDefault();
                    t = $("#teammembersName").val();
                    r = $("#designation").val();
                    m = $("#member-img").attr("src");
                    i = $("#cover-img").attr("src");
                    n = m.substring(m.indexOf("/as") + 1) == "/fg_addon/static/modern/assets/images/users/user-dummy-img.jpg" ? "" : m;
                    a = t.match(/\b(\w)/g).join("").substring(0, 2);
                    if (t === "" || r === "" || editlist) {
                        if (t !== "" && r !== "" && editlist) {
                            o = 0;
                            o = $("#memberid-input").val();
                            allmemberlist = $.map(allmemberlist, function(e) {
                                if (e.id == o) {
                                    return {
                                        id: o,
                                        coverImg: i,
                                        bookmark: e.bookmark,
                                        memberImg: m,
                                        nickname: a,
                                        memberName: t,
                                        position: r,
                                        projects: $("#project-input").val(),
                                        tasks: $("#task-input").val()
                                    };
                                }
                                return e;
                            });
                            editlist = !1;
                        }
                    } else {
                        l = findNextId();
                        allmemberlist.push({
                            id: l,
                            coverImg: i,
                            bookmark: !1,
                            memberImg: n,
                            nickname: a,
                            memberName: t,
                            position: r,
                            projects: "0",
                            tasks: "0"
                        });
                        sortElementsById();
                    }
                    loadTeamData(allmemberlist);
                    $("#createMemberBtn-close").click();
                } else {
                    e.preventDefault();
                    e.stopPropagation();
                }
                $(this).addClass("was-validated");
            }, !1);
        });
    })();

    function safeStr(val) {
    return (val || "").toString().toLowerCase();
    }
    var searchMemberList = $("#searchMemberList");
    searchMemberList.on("keyup", function() {
        var t = $(this).val().toLowerCase();
        var filtered = $.grep(allmemberlist, function(e) {
            return safeStr(e.memberName).includes(t) ||
                safeStr(e.position).includes(t) ||
                safeStr(e.mobile).includes(t) ||
                safeStr(e.email).includes(t);
        });

        if (filtered.length === 0) {
            $("#noresult").show();
            $("#teamlist").hide();
        } else {
            $("#noresult").hide();
            $("#teamlist").show();
        }
        loadTeamData(filtered);
    });


    const countries = {
        // 🌍 المنطقة العربية
        "20": 10,   // مصر
        "966": 9,   // السعودية
        "971": 9,   // الإمارات
        "965": 8,   // الكويت
        "968": 8,   // عمان
        "974": 8,   // قطر
        "973": 8,   // البحرين
        "962": 9,   // الأردن
        "964": 10,  // العراق
        "213": 9,   // الجزائر
        "212": 9,   // المغرب
        "216": 8,   // تونس
        "249": 9,   // السودان
        "963": 9,   // سوريا
        "961": 8,   // لبنان
        "967": 9,   // اليمن
        "218": 9,   // ليبيا

        // 🌍 أفريقيا
        "234": 10,  // نيجيريا
        "27": 9,    // جنوب أفريقيا

        // 🌍 أوروبا
        "44": 10,   // بريطانيا
        "33": 9,    // فرنسا
        "49": 11,   // ألمانيا
        "39": 10,   // إيطاليا
        "34": 9,    // إسبانيا
        "90": 10,   // تركيا
        "7": 10,    // روسيا

        // 🌍 آسيا
        "91": 10,   // الهند
        "81": 10,   // اليابان
        "82": 10,   // كوريا
        "86": 11,   // الصين
        "62": 10,   // إندونيسيا
        "63": 10,   // الفلبين
        "60": 9,    // ماليزيا
        "66": 9,    // تايلاند
        "65": 8,    // سنغافورة
        "92": 10,   // باكستان
        "98": 10,   // إيران

        // 🌍 الأمريكتين
        "1": 10,    // أمريكا وكندا
        "55": 11,   // البرازيل
        "52": 10,   // المكسيك
        "54": 10,   // الأرجنتين
    };

    $("#mobile").on("keypress", function (e) {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    }).on("paste", function (e) {
      e.preventDefault();
    }).on("input", function () {
      let val = $(this).val();
      let isValid = false;

      for (let code in countries) {
        if (val.startsWith(code)) {
          let expectedLength = code.length + countries[code];
          if (val.length === expectedLength) {
            isValid = true;
          }
          break;
        }
      }

      if (isValid) {
        $(this).css("border", "1px solid green");
        $(this).removeClass("not_valid");
        
      } else {
        $(this).css("border", "1px solid red");
        $(this).addClass("not_valid");
       
      }
    });
    $(document).on('submit', '.create_member_form', function(e) {
        e.preventDefault()

        var formData = new FormData($(this)[0])
        var user_branches = formData.get('branches')
        if (user_branches){
            var user_selected_branches = $("#branches").val();
            if (user_selected_branches.length > 0){
                formData.append("usr_branch_count", user_selected_branches.length);
                $.each(user_selected_branches, function (index, value) {
                
                    formData.append("usr_branch_" + index + "_id", value);
                });

            }

        }else{
            Swal.fire(
                {title:"Oops...",
                text:"You Should Select At Least One Branch!",
                icon:"error",
                confirmButtonClass:"btn btn-primary w-xs mt-2",
                buttonsStyling:1,
                showCloseButton:!0}
            )
            return false;
        }
        if ($("#mobile").hasClass("not_valid")) {
            
            Swal.fire(
                {title:"Oops...",
                text:"Mobile Number Not accepted!",
                icon:"error",
                confirmButtonClass:"btn btn-primary w-xs mt-2",
                buttonsStyling:1,
                showCloseButton:!0}
            )
            return false;

        } 

        $.ajax({
            type: 'POST',
            url: '/ajax/add_staff_user',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            error: function (jqXHR, textStatus, errorMessage) {
                console.log(errorMessage);
            },
            success: function (data) {
                    console.log(data);
                    if(data.error){
                        Swal.fire(
                            {title:"Oops...",
                            text:data.error,
                            icon:"error",
                            confirmButtonClass:"btn btn-primary",
                            buttonsStyling:1,
                            showCloseButton:!0}
                        )
                        return false;
                    }
                    if (data.role){
                        if (data.role == "doctor"){
                            window.location.replace(`/staff/profile/${data.user_id}/edit`);

                        }else{
                            window.location.replace('/staff/list');
                        }

                    }else{
                        window.location.replace('/staff/list');
                    }
                
                    
                    console.log(data);
                
            }
        });


    })
     
    $(document).on('submit', '.edit_member_form', function(e) {
        e.preventDefault()
        var formData = new FormData($(this)[0])
        var user_branches = formData.get('branches')
        if (user_branches){
            var user_selected_branches = $("#branches").val();
            if (user_selected_branches.length > 0){
                formData.append("usr_branch_count", user_selected_branches.length);
                $.each(user_selected_branches, function (index, value) {
                
                    formData.append("usr_branch_" + index + "_id", value);
                });

            }

        }

        $.ajax({
            type: 'POST',
            url: '/ajax/update_staff_user',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            error: function (jqXHR, textStatus, errorMessage) {
                console.log(errorMessage);
            },
            success: function (data) {
                    // console.log(data);
                    if(data.error){
                        Swal.fire(
                            {title:"Oops...",
                            text:data.error,
                            icon:"error",
                            confirmButtonClass:"btn btn-primary",
                            buttonsStyling:1,
                            showCloseButton:!0}
                        )
                        return false;
                    }
                    
                    window.location.replace('/staff/list');
                
            }
        });
     
    })



}