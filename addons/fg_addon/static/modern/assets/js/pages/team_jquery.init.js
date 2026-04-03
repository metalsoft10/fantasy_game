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

var url = "/fg_addon/static/modern/assets/json/", allmemberlist = "";

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
                                                    <li><a class="dropdown-item edit-list" href="#addmemberModal"  data-bs-toggle="modal" data-edit-id="${r.id}"><i class="ri-pencil-line me-2 align-bottom text-muted"></i>Edit</a></li>                                                                           
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
                                                <p class="text-muted member-designation mb-0">${r.position}</p>                                
                                            </div>                            
                                        </div>                        
                                    </div>                        
                                    <div class="col-lg-4 col">                            
                                        <div class="row text-muted text-center">                                
                                            <div class="col-6 border-end border-end-dashed">                                    
                                                <h5 class="mb-1 projects-num">${r.projects}</h5>                                    
                                                <p class="text-muted mb-0">Projects</p>                                
                                            </div>                                
                                            <div class="col-6">                                    
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
                $("#team-member-list").append(member_list_content);
        bookmarkBtn();
        editMemberList();
        removeItem();
        memberDetailShow();
    });
}

function bookmarkBtn() {
    $(".favourite-btn").each(function() {
        $(this).on("click", function() {
            $(this).hasClass("active") ? $(this).removeClass("active") : $(this).addClass("active");
        });
    });
}

$.getJSON(url + "team-member-list.json", function(e) {
    allmemberlist = e;
    loadTeamData(allmemberlist);
}).fail(function(e) {
    console.error(e);
});

bookmarkBtn();
var editlist = !1;

function editMemberList() {
    var r;
    $(".edit-list").each(function() {
        $(this).on("click", function(e) {
            r = $(this).data("edit-id");
            allmemberlist = $.map(allmemberlist, function(e) {
                if (e.id == r) {
                    editlist = !0;
                    $("#createMemberLabel").html("Edit Member");
                    $("#addNewMember").html("Save");
                    if (e.memberImg == "") {
                        $("#member-img").attr("src", "assets/images/users/user-dummy-img.jpg");
                    } else {
                        $("#member-img").attr("src", e.memberImg);
                    }
                    $("#cover-img").attr("src", e.coverImg);
                    $("#memberid-input").val(e.id);
                    $("#teammembersName").val(e.memberName);
                    $("#designation").val(e.position);
                    $("#project-input").val(e.projects);
                    $("#task-input").val(e.tasks);
                    $("#memberlist-form").removeClass("was-validated");
                }
                return e;
            });
        });
    });
}

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

function memberDetailShow() {
    $(".team-box").each(function() {
        $(this).find(".member-name").on("click", function() {
            var e = $(this).find("h5").html(),
                t = $(this).closest(".team-box").find(".member-designation").html(),
                r = $(this).closest(".team-box").find(".member-img").length ? $(this).closest(".team-box").find(".member-img").attr("src") : "assets/images/users/user-dummy-img.jpg",
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

$(".addMembers-modal").each(function() {
    $(this).on("click", function(e) {
        $("#createMemberLabel").html("Add New Members");
        $("#addNewMember").html("Add Member");
        $("#teammembersName").val("");
        $("#designation").val("");
        $("#cover-img").attr("src", "assets/images/small/img-9.jpg");
        $("#member-img").attr("src", "assets/images/users/user-dummy-img.jpg");
        $("#memberlist-form").removeClass("was-validated");
    });
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
                n = m.substring(m.indexOf("/as") + 1) == "assets/images/users/user-dummy-img.jpg" ? "" : m;
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
        return e.memberName.toLowerCase().indexOf(t.toLowerCase()) !== -1 || e.position.toLowerCase().indexOf(t.toLowerCase()) !== -1;
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