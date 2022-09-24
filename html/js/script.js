MR = {};
MR.Characters = {};
MR.Characters.Functions = {};
MR.Characters.SelectedChar = null;
MR.Characters.CurrentPage = "firstname";
MR.Characters.SelectedPage = 1;
MR.Characters.Pages = {
    [1]: {
        ['name']: 'firstname',
        ['label']: 'FIRSTNAME',
    },
    [2]: {
        ['name']: 'lastname',
        ['label']: 'LASTNAME',
    },
    [3]: {
        ['name']: 'nationality',
        ['label']: 'NATIONALITY',
    },
    [4]: {
        ['name']: 'birthdate',
        ['label']: 'BIRTHDATE',
    },
    [5]: {
        ['name']: 'gender',
        ['label']: 'GENDER',
    },
};

$(document).on('click', '.disconnect-button', function(e) {    
    e.preventDefault();
    $('.characters-list').css("filter", "blur(4px)");
    $('.disconnect-confirmation').fadeIn(150);
});

$(document).on('click', '#disconnect-accept', function(e) {    
    e.preventDefault();
    $('.characters-list').css("filter", "none");
    $.post(`https://${GetParentResourceName()}/CloseUI`);
    $.post(`https://${GetParentResourceName()}/DisconnectButton`);
});

$(document).on('click', '#disconnect-cancel', function(e) {    
    e.preventDefault();
    $('.characters-list').css("filter", "none");
    $('.disconnect-confirmation').fadeOut(150);
});

$(document).on('click', '.delete-button', function(e) {    
    e.preventDefault();
    if (MR.Characters.SelectedChar !== null) {
        let charData = $(MR.Characters.SelectedChar).data('cid');
        if (charData !== "") {
            $('.characters-list').css("filter", "blur(4px)");
            $('.delete-confirmation').fadeIn(150);
        } else {
            MR.Characters.Functions.Notify("fas fa-user-friends", "Characters", "No character found on this slot.", "#e74c3c", 500);
        }
    } else {
        MR.Characters.Functions.Notify("fas fa-user-friends", "Characters", "You did not select a Character.", "#e74c3c", 500);
    }
})

$(document).on('click', '#delete-accept', function(e) {    
    e.preventDefault();
    $.post(`https://${GetParentResourceName()}/RemoveCharacter`, JSON.stringify({
        citizenid: $(MR.Characters.SelectedChar).data("citizenid"),
    }));
    $('.delete-confirmation').fadeOut(150);
    $('.characters-list').css("filter", "none");
    MR.Characters.Functions.FadeOutRight('.characters-list', "-40%", 400);
    setTimeout(function(){
        MR.Characters.Functions.Refresh();
    }, 3000);
});

$(document).on('click', '#delete-cancel', function(e) {    
    e.preventDefault();
    $('.characters-list').css("filter", "none");
    $('.delete-confirmation').fadeOut();
})

$(document).on('click', '.character-list-header-return', function(e) {    
    e.preventDefault();
    MR.Characters.SelectedPage = MR.Characters.SelectedPage - 1
    if (MR.Characters.CurrentPage === 'firstname') {
        $('.characters-list').css("filter", "none");
        MR.Characters.Functions.FadeOutLeft('.character-register-new', '-40%', 400);
        setTimeout(() => {
            MR.Characters.Functions.ResetRegister();
            MR.Characters.Functions.ResetValues();
            MR.Characters.Functions.EnableCharSelector();
        }, 500);
    } else {
        $("."+MR.Characters.CurrentPage).fadeOut(150);
        $(".character-register-new-content").fadeOut(150);
        $(".char-waiting-spinner").fadeIn(150);
        setTimeout(() => {
            MR.Characters.CurrentPage = MR.Characters.Pages[MR.Characters.SelectedPage]['name'];
            $(".character-list-header-select-reg").find('p').html(MR.Characters.Pages[MR.Characters.SelectedPage]['label']);
            if (MR.Characters.CurrentPage === 'birthdate') {
                $("#button-icon-reg").html('<i class="fas fa-arrow-circle-right fa-3x"></i>')
                $("#next-text").html('Next');
                $("#next-text-description").html('Continue');
            }
            $(".char-waiting-spinner").fadeOut(50);
            $(".character-register-new-content").fadeIn(150);
            $("."+MR.Characters.CurrentPage).fadeIn(150);
            $(".character-list-header-reg").addClass('fadeInAnim');
            $(".character-list-header-select-reg").addClass('fadeInAnim');
        }, 1000);
    }
});

$(document).on('click', '.next-button', function(e) {    
    e.preventDefault();
    MR.Characters.SelectedPage = MR.Characters.SelectedPage + 1
    // End Register
    if (MR.Characters.CurrentPage === 'gender') {
        $("."+MR.Characters.CurrentPage).fadeOut(150);
        $(".character-register-new-content").fadeOut(150);
        $(".char-waiting-spinner").find('p').html('Creating Character');
        $(".char-waiting-spinner").fadeIn(150);
        setTimeout(() => {
            $(".char-waiting-spinner").fadeOut(50);
            // Create Char
            if ( ($('#first_name').val() !== "") && ($('#last_name').val() !== "") && ($('#nationality').val() !== "") && ($('#birthdate').val() !== "") && ($('select[name=gender]').val() !== "" )) {
                if ( ($('#first_name').val() !== "Firstname") && ($('#last_name').val() !== "Lastname") && ($('#birthdate').val() !== "00-00-0000") ) {
                  $.post(`https://${GetParentResourceName()}/CreateNewCharacter`, JSON.stringify({
                      firstname: $('#first_name').val(),
                      lastname: $('#last_name').val(),
                      nationality: $('#nationality').val(),
                      birthdate: $('#birthdate').val(),
                      gender: $('select[name=gender]').val(),
                      cid: $(MR.Characters.SelectedChar).attr('id').replace('char-', ''),
                  }));
                  $(".container").fadeOut(150);
                  $('.characters-list').css("filter", "none");
                  MR.Characters.Functions.FadeOutLeft('.character-register-new', '-40%', 400); 
                  MR.Characters.Functions.Refresh();
                  MR.Characters.Functions.ResetRegister();
              } else {
                MR.Characters.Functions.Notify("fas fa-user-friends", "Characters", "First name, last name and date of birth are not valid.", "#e74c3c", 500);
                MR.Characters.Functions.ResetRegister();
            }
          } else {
            MR.Characters.Functions.Notify("fas fa-user-friends", "Characters", "Not all fields are filled in!", "#e74c3c", 500);
            MR.Characters.Functions.ResetRegister();
          }
        }, 2000);
    } else {
        $("."+MR.Characters.CurrentPage).fadeOut(150);
        $(".character-register-new-content").fadeOut(150);
        $(".char-waiting-spinner").fadeIn(150);
        setTimeout(() => {
            MR.Characters.CurrentPage = MR.Characters.Pages[MR.Characters.SelectedPage]['name'];
            $(".character-list-header-select-reg").find('p').html(MR.Characters.Pages[MR.Characters.SelectedPage]['label']);
            if (MR.Characters.CurrentPage === 'gender') {
                $("#button-icon-reg").html('<i class="fas fa-check fa-3x"></i>')
                $("#next-text").html('Confirm');
                $("#next-text-description").html('Create character');
            }
            $(".char-waiting-spinner").fadeOut(50);
            $(".character-register-new-content").fadeIn(150);
            $("."+MR.Characters.CurrentPage).fadeIn(150);
            $(".character-list-header-reg").addClass('fadeInAnim');
            $(".character-list-header-select-reg").addClass('fadeInAnim');
        }, 1000);
    }
});

$(document).on('click', '.character', function(e) {    
    e.preventDefault();

    let cDataPed = $(this).data('cData');

    MR.Characters.Functions.DisableCharSelector();

    if (MR.Characters.SelectedChar === null) {
        MR.Characters.SelectedChar = $(this);

        if ((MR.Characters.SelectedChar).data('cid') == "") {
            $(MR.Characters.SelectedChar).addClass("char-selected");
            
            // MAKE CHAR TEXT
            $("#play-text").html("Create");
            $("#play-text-description").html("Create Identity");
            $.post(`https://${GetParentResourceName()}/cDataPed`, JSON.stringify({
                cData: cDataPed
            }));
        } else {
            $(MR.Characters.SelectedChar).addClass("char-selected");

            // CONFIRM CHAR TEXT
            $("#play-text").html("Confirm");
            $("#play-text-description").html("Confirm Identity");
            $.post(`https://${GetParentResourceName()}/cDataPed`, JSON.stringify({
                cData: cDataPed
            }));
        }

    } else if ($(MR.Characters.SelectedChar).attr('id') !== $(this).attr('id')) {
        $(MR.Characters.SelectedChar).removeClass("char-selected");
        MR.Characters.SelectedChar = $(this);
        if ((MR.Characters.SelectedChar).data('cid') == "") {
            $(MR.Characters.SelectedChar).addClass("char-selected");

            // MAKE CHAR TEXT
            $("#play-text").html("Create");
            $("#play-text-description").html("Create Identity");
            $.post(`https://${GetParentResourceName()}/cDataPed`, JSON.stringify({
                cData: cDataPed
            }));
        } else {
            $(MR.Characters.SelectedChar).addClass("char-selected");

            // CONFIRM CHAR TEXT
            $("#play-text").html("Confirm");
            $("#play-text-description").html("Confirm Identity");
            $.post(`https://${GetParentResourceName()}/cDataPed`, JSON.stringify({
                cData: cDataPed
            }));
        }
    }
});

$(document).on('click', '.play-button', function(e) {
    e.preventDefault();
    let charData = $(MR.Characters.SelectedChar).data('cid');

    if (MR.Characters.SelectedChar !== null) {
        if (charData !== "") {
            $.post(`https://${GetParentResourceName()}/SelectCharacter`, JSON.stringify({
                cData: $(MR.Characters.SelectedChar).data('cData')
            }));
            MR.Characters.Functions.FadeOutRight('.characters-list', "-40%", 400);
            setTimeout(function(){
                $(MR.Characters.SelectedChar).removeClass("char-selected");
                MR.Characters.SelectedChar = null;
                MR.Characters.Functions.ResetAll();
            }, 1500);
        } else {
            MR.Characters.CurrentPage = "firstname";
            MR.Characters.Functions.FadeInLeft('.character-register-new', '5%', 400);
            MR.Characters.Functions.DisableCharSelector();
        }
    } else {
        MR.Characters.Functions.Notify("fas fa-user-friends", "Karakters", "You have no character selected.", "#e74c3c", 500);
    }
});

// Functions

MR.Characters.Functions.Setup = function(characters) {
    $.each(characters, function(index, char){
        $('#char-'+char.cid).html("");
        $('#char-'+char.cid).data("citizenid", char.citizenid);
        setTimeout(function(){
            $('#char-'+char.cid).html('<span id="slot-icon"><i class="fas fa-user fa-3x"></i></span><span id="slot-name">'+char.charinfo.firstname+' '+char.charinfo.lastname+'</span><span id="slot-name-description">$'+char.money.bank+' | '+char.job.label+'</span>');
            $('#char-'+char.cid).data('cData', char)
            $('#char-'+char.cid).data('cid', char.cid)
        }, 100)
    });
}

MR.Characters.Functions.Refresh = function() {
    $('.characters-list').html(
        '<div class="character-list-header"><p>MY CHARACTERS</p></div><div class="character-list-header-select"><p>SELECT A CHARACTER</p></div> <div class="character" id="char-1" data-cid=""> <span id="slot-icon"><i class="fas fa-user fa-3x"></i></span> <span id="slot-name">Empty slot</span></span> <span id="slot-name-description">No data...</span></span> </div> <div class="character" id="char-2" data-cid=""> <span id="slot-icon"><i class="fas fa-user fa-3x"></i></span> <span id="slot-name">Empty slot</span></span> <span id="slot-name-description">No data...</span></span> </div> <div class="character" id="char-3" data-cid=""> <span id="slot-icon"><i class="fas fa-user fa-3x"></i></span> <span id="slot-name">Empty slot</span></span> <span id="slot-name-description">No data...</span></span> </div> <div class="character" id="char-4" data-cid=""> <span id="slot-icon"><i class="fas fa-user fa-3x"></i></span> <span id="slot-name">Empty slot</span></span> <span id="slot-name-description">No data...</span></span> </div>' +
        '<div class="play-button"><span id="button-icon"><i class="fas fa-check fa-3x"></i></span><div class="play-btn" id="play"><p id="play-text">Confirm</p></div><span id="button-name-description"><p id="play-text-description">Confirm Identity</p></span></div>' +
        '<div class="delete-button"><span id="button-icon"><i class="fas fa-trash-alt fa-3x"></i></span><div class="delete-btn" id="delete"><p id="delete-text">Delete</p></div><span id="button-name-description">Delete Character</span></div>' +
        '<div class="disconnect-button"><span id="button-icon"><i class="fas fa-ban fa-3x"></i></span><div class="disconnect-btn" id="disconnect"><p id="disconnect-text">Disconnect</p></div><span id="button-name-description">Disconnect from city</span></div>'); 
    $(MR.Characters.SelectedChar).removeClass("char-selected");
    setTimeout(function(){
        MR.Characters.SelectedChar = null;
        $.post(`https://${GetParentResourceName()}/SetupCharacters`);
        MR.Characters.Functions.ResetAll();
        MR.Characters.Functions.FadeInRight('.characters-list', '5%', 1000);
    }, 100)
}

MR.Characters.Functions.ResetRegister = function() {
    $(".character-register-new").addClass('shakeAnim');
    MR.Characters.SelectedPage = 1;
    $(".char-waiting-spinner").find('p').html('Laden');
    $(".character-register-new-content").fadeIn(150);
    $(".firstname").fadeIn(150);
    MR.Characters.CurrentPage = MR.Characters.Pages[MR.Characters.SelectedPage]['name'];
    $(".character-list-header-select-reg").find('p').html(MR.Characters.Pages[MR.Characters.SelectedPage]['label']);
    $("#button-icon-reg").html('<i class="fas fa-arrow-circle-right fa-3x"></i>')
    $("#next-text").html('Next');
    $("#next-text-description").html('Continue');
    setTimeout(() => {
        $(".character-register-new").removeClass('shakeAnim');
    }, 2000);
}

MR.Characters.Functions.DisableCharSelector = function() {
    $(".character").addClass('disabled');
    $(".delete-button").addClass('disabled');
    $(".play-button").addClass('disabled');
    $(".disconnect-button").addClass('disabled');
}

MR.Characters.Functions.EnableCharSelector = function() {
    $(".character").removeClass('disabled');
    $(".delete-button").removeClass('disabled');
    $(".play-button").removeClass('disabled');
    $(".disconnect-button").removeClass('disabled');
}

MR.Characters.Functions.ResetValues = function() {
    $('#first_name').val('');
    $('#last_name').val('');
    $('#nationality').val('');
    $('#birthdate').val('');
}

MR.Characters.Functions.ResetAll = function() {
    $('.characters-list').hide();
    $('.characters-list').css("right", "-45vh");

    $('#first_name').val('')
    $('#last_name').val('')
    $('#nationality').val('')
    $('#birthdate').val('')
}

MR.Characters.Functions.FadeOutLeft = function(element, percent, time) {
    if (percent !== undefined) {
        $(element).css({"display":"block"}).animate({left: percent,}, time, function(){
            $(element).css({"display":"none"});
        });
    } else {
        $(element).css({"display":"block"}).animate({left: "103.5%",}, time, function(){
            $(element).css({"display":"none"});
        });
    }
}

MR.Characters.Functions.FadeOutRight = function(element, percent, time) {
    if (percent !== undefined) {
        $(element).css({"display":"block"}).animate({right: percent,}, time, function(){
            $(element).css({"display":"none"});
        });
    } else {
        $(element).css({"display":"block"}).animate({right: "103.5%",}, time, function(){
            $(element).css({"display":"none"});
        });
    }
}

MR.Characters.Functions.FadeInRight = function(element, percent, time) {
    $(element).css({"display":"block"}).animate({right: percent,}, time);
}

MR.Characters.Functions.FadeInLeft = function(element, percent, time) {
    $(element).css({"display":"block"}).animate({left: percent,}, time);
}

MR.Characters.Functions.Notify = function (icon, title, text, color, timeout) {
  $(".notification-icon").css({ color: color });
  $(".notification-title").css({ color: color });
  $(".notification-icon").html('<i class="'+icon+'"></i>');
  $(".notification-title").html(title);
  $(".notification-text").html(text);
  setTimeout(function () {
    $(".notification-container").css({display: "block"}).animate({
        top: "10%",
    }, 200);
  }, timeout != null ? timeout : 1500);

  setTimeout(function () {
    $(".notification-container").animate({
        top: "-10%",
    }, 200).css({ display: "block" });
  }, timeout + 5000);
};

// Listener

$(document).ready(function (){
    window.addEventListener('message', function (event) {
        let data = event.data;
        if (data.action == "ui") {
            if (data.toggle) {
                $('.container').show();
                MR.Characters.Functions.DisableCharSelector();
                MR.Characters.Functions.ResetAll();
                setTimeout(function(){
                    $.post(`https://${GetParentResourceName()}/SetupCharacters`);
                    MR.Characters.Functions.FadeInRight('.characters-list', '5%', 1000);
                    MR.Characters.Functions.EnableCharSelector();
                }, 500);
            } else {
                $('.container').fadeOut(250);
                MR.Characters.Functions.ResetAll();
            }
        } else if (data.action == "SetupCharacters") {
            MR.Characters.Functions.Setup(event.data.characters);
        } else if (data.action == "DisableCharSelector") {
            MR.Characters.Functions.DisableCharSelector();
        } else if (data.action == "EnableCharSelector") {
            MR.Characters.Functions.EnableCharSelector();
        }
    });
});