window.modalConfigs["patient"] = {
    form_post_url:"/ajax/add_patient_user",
    form: sharedModalFormTmpl({
                                member_image:sharedModal_member_image_tmpl({name:"image_1920"}),
                                cover: sharedModal_cover_Tmpl({title:_js_translate('sharedModal_patient_title'),with_input:false}),
                                inputs: sharedModal_generateFields([
                                                                    { id:'sharedModal_name', type: 'text', name: 'name' , label: _js_translate('sharedModal_name_input'), placeholder: _js_translate('sharedModal_name_placeholder'), required: true },
                                                                    { id:'sharedModal_mobile', type: 'mobile', name: 'mobile', label: _js_translate('sharedModal_mobile_input'), placeholder: _js_translate('sharedModal_mobile_placeholder'), autocomplete:"new-mobile", required: true },
                                                                    [
                                                                        { id:'sharedModal_login', type: 'text', name: 'login', label: _js_translate('sharedModal_username_input'), placeholder: _js_translate('sharedModal_username_placeholder'), required: true },
                                                                        { id:'sharedModal_password', type: 'password', name: 'password', label: _js_translate('sharedModal_password_input'), placeholder: _js_translate('sharedModal_password_placeholder'),autocomplete:"new-password", required: true }
                                                                    ],
                                                                    { id:'sharedModal_email', type: 'email', name: 'email', label: _js_translate('sharedModal_email_input'), placeholder: _js_translate('sharedModal_email_placeholder'), autocomplete:"new-email" },
                                                                    ])
                            }),
    befor_post:() => {
        if ($("#sharedModal_mobile").hasClass("not_valid")) {
            Swal.fire(
                {title:"Oops...",
                text:"Mobile Number Not accepted!",
                icon:"error",
                buttonsStyling:1,
                showCloseButton:!0}
            )
            return false;
        }
        

        return true;
    },
    onSave: () => {
        
    },
    onShowModal: () => {
        update_sharedModal_mobile_input()
        var timestamp = Math.floor(Date.now() / 1000);
        $("#sharedModal_login").val(timestamp)
        $("#sharedModal_login").attr("readonly","1")
    }
};


registerModalCallback("patient_wizzard_form_callback", function({ config_data,config_type,mode,res_data,type}) {
    
    $("#startup_wizzard_patient_list").append(`

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

    
});

$(document).on("click", ".edit-list", function(e) {
    e.preventDefault();
    var patient = $(this).data("patient_json");
    
    openDynamicModal('patient', 'edit', patient);
});

if($('.medical_patient_list').length > 0){

        // ---------------------------------------------------------------------------------------------------------
        // switch between card and list
        var buttonGroups, list = $(".team-list");
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
        // ---------------------------------------------------------------------------------------------------------
        
        // ---------------------------------------------------------------------------------------------------------
        // load Patient info
        function loadTeamData(e) {
            
            $("#team-member-list").html("");
            $(e).each(function(t, r) {
                var branche_cover = r.coverImg
                        
                if(r.coverImg == ""){
                    branche_cover = "/medical_base/static/modern/assets/images/users/patient_cover.png"
                }
                        
                var m = $(r).attr("bookmark") ? "active" : "",
                    i = $(r).attr("memberImg") ? '<img src="' + $(r).attr("memberImg") + '" alt="" class="member-img img-fluid d-block rounded-circle" />' : '<div class="avatar-title border bg-light text-primary rounded-circle text-uppercase">' + $(r).attr("nickname") + "</div>";
                
                    $("#team-member-list").append(patient_list_content({r:r, branche_cover:branche_cover, i:i}));
               
                
            });
        }
        
        $.getJSON("/ajax/patient/list", function(e) {
            allmemberlist = e;
            loadTeamData(allmemberlist);
        }).fail(function(e) {
            console.error(e);
        });

        // ---------------------------------------------------------------------------------------------------------

        
        

        
        

        // function editMemberList() {
        //     var r;
        //     $(".edit-list").each(function() {
        //         $(this).on("click", function(e) {
        //             r = $(this).data("edit-id");
        //             allmemberlist = $.map(allmemberlist, function(e) {
        //                 if (e.id == r) {
        //                     editlist = !0;
        //                     $("#createMemberLabel").html("Edit Member");
        //                     $("#addNewMember").html("Save");
        //                     if (e.memberImg == "") {
        //                         $("#member-img").attr("src", "/medical_base/static/modern/assets/images/users/user-dummy-img.jpg");
        //                     } else {
        //                         $("#member-img").attr("src", e.memberImg);
        //                     }
        //                     $("#cover-img").attr("src", e.coverImg);
        //                     $("#memberid-input").val(e.id);
        //                     $("#teammembersName").val(e.memberName);
        //                     $("#designation").val(e.position);
        //                     $("#project-input").val(e.projects);
        //                     $("#task-input").val(e.tasks);
        //                     $("#memberlist-form").removeClass("was-validated");
        //                 }
        //                 return e;
        //             });
        //         });
        //     });
        // }

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

        

        function memberDetailShow() {
            $(".team-box").each(function() {
                $(this).find(".member-name").on("click", function() {
                    var e = $(this).find("h5").html(),
                        t = $(this).closest(".team-box").find(".member-designation").html(),
                        r = $(this).closest(".team-box").find(".member-img").length ? $(this).closest(".team-box").find(".member-img").attr("src") : "/medical_base/static/modern/assets/images/users/user-dummy-img.jpg",
                        m = $(this).closest(".team-box").find(".team-cover img").attr("src"),
                        i = $(this).closest(".team-box").find(".projects-num").html(),
                        n = $(this).closest(".team-box").find(".tasks-num").html();
                    $("#member-overview .profile-img").attr("src", r);
                    $("#member-overview .team-cover img").attr("src", m);
                    $("#member-overview .profile-name").html(e);
                    $("#member-overview .profile-designation").html(t);
                    $("#member-overview .profile-project").html(i);
                    $("#member-overview .profile-task").html(n);
                });
            });
        }

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
                        n = m.substring(m.indexOf("/as") + 1) == "/medical_base/static/modern/assets/images/users/user-dummy-img.jpg" ? "" : m;
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

        var searchMemberList = $("#searchMemberList");
        searchMemberList.on("keyup", function() {
            var e = $(this).val().toLowerCase();
            t = e;
            var t, e = $.grep(allmemberlist, function(e) {
                return e.memberName.toLowerCase().indexOf(t.toLowerCase()) !== -1 || e.mobile.toLowerCase().indexOf(t.toLowerCase()) !== -1;
            });
            if (e.length == 0) {
                $("#noresult").css("display", "block");
                $("#teamlist").css("display", "none");
            } else {
                $("#noresult").css("display", "none");
                $("#teamlist").css("display", "block");
            }
            loadTeamData(e);
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
        
        $(document).on("submit", ".create_patient_form", function(e){
                e.preventDefault();
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
                var formData = new FormData($(this)[0])
                $.ajax({
                    type: 'POST',
                    url: '/ajax/add_patient_user',
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
                            
                            window.location.replace('/patient/list');
                        
                    }
                });


                
        })
}