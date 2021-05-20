window.dataLayer = window.dataLayer || [];
function gtag()
{ 
	dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-XLFH7YHQ85');

$(function ()
{
    getStates();
});

var attemptCount = 1;
const baseURL = 'https://cdn-api.co-vin.in/api/v2';

function setTimer() {
    document.getElementById("attemptCount").innerHTML = attemptCount;
    var maxTicks = 30;
    var tickCount = 0;
    var tick = function () {
    			if (tickCount >= maxTicks) {
               		clearInterval(myInterval);
               		getAvailability();
               		attemptCount++;
               		document.getElementById("attemptCount").innerHTML = attemptCount;
               		return;
            	}
            	document.getElementById("timer").innerHTML = (maxTicks - tickCount);
            	tickCount++;
        };
    var myInterval = setInterval(tick, 1000);
}
function resetSearch(){
    window.location.reload();
}
function getAvailability() {
    document.getElementById("searchButton").disabled = true; 
    document.getElementById("resetButton").style = "display:block"
    var stateId = $("#states option:selected").val();
    var districtId = $("#district option:selected").val();
    if (stateId > 0 && districtId > 0) {
        var todaysDate = new Date();
        const options = { dateStyle: 'short' };
        const date = todaysDate.toLocaleString('hi-IN', options);
		document.getElementById("data").innerHTML = "";
        $.ajax({
            type: 'GET',
            url: baseURL + '/appointment/sessions/public/calendarByDistrict',
            data: {
                "district_id": districtId,
                "date": date
            },
            success: function (resp) {
            }
        }).done(
        function (response) {
            let centerDatas = "";
            if (response?.centers?.length > 0) {
                let availabilityFound = false;
                response.centers.forEach(center => {
                    center.sessions.forEach(session => {
                        if (session.available_capacity > 0) {
                            availabilityFound = true;
                        }
                    });
                });

            	if (availabilityFound) {
                	play();
                	document.getElementById("alert").style = "display:none"
            	} else {
                	setTimer();
                	playWait();
                	document.getElementById("alert").style = "display:block"
            	}

                response.centers.forEach(element => {
                    centerDatas += `
                    <div class="card p-3 m-2">
                        <h5 class="card-title text-secondary">${element.name} <span class="badge badge-success">${element.fee_type} Vaccine</span></h5>
                        <p><strong>Address </strong> : ${element.address} </p>
                        <p> &#128337; ${element.from} - ${element.to}</p>
                        <span>${getSessions(element.sessions)}</span>
                    </div>
                `
                })
            } else {
                playNoSlots();
                alert("No Centers are available!");

            }
            document.getElementById("data").innerHTML = centerDatas;
            }).fail(function (data) {
                alert("failed");
            });
        } else {
        alert("Select state and district!");
    }
}

function getSessions(sessions) {
    var sessionsData = "";
    if (sessions?.length > 0) {
        sessions.forEach(session => {
            if (session.available_capacity > 0) {
                
                sessionsData +=
                    `<h4> Sessions </h4>
                	<h4 class="text-primary">Available Capacity : ${session.available_capacity} 
                    <span class="badge badge-success"> <a href='https://selfregistration.cowin.gov.in/' target="_blank">Book Now</a> </span> 
                    </h4>                    
                	<span>${getSlots(session)}</span>`
            }
        })
    }
    return sessionsData;
}

function getSlots(session) {
    var slotsData = "";
    if (session?.slots?.length > 0 && session.available_capacity > 0) {
        slotsData +=
            `
                <h6>Date : ${session.date}</h6>
                <h6>Min Age Limit : ${session.min_age_limit}</h6>
                <h6>Time Slots </h6>
            `
        session.slots.forEach(slot => {
            slotsData += `<h6>${slot}</h6>`
        })
    }
    return slotsData;
}

function getDistricts() {
    document.getElementById("data").innerHTML = "";
    var stateId = $("#states option:selected").val();
    $.ajax({
        type: 'GET',
        url: baseURL + '/admin/location/districts/' + stateId,
        success: function (resp) {
        }
    }).done(
        function (response) {
            let districtsOptionsHTML = "";
            if (response?.districts?.length > 0) {
                response.districts.forEach(element => {
                    districtsOptionsHTML += `<option value="${element.district_id}"> ${element.district_name} </option>`
                });
                document.getElementById("district").innerHTML = districtsOptionsHTML;
            }
        }).fail(function (data) {
            alert("failed");
        });
}

function getStates() {
    $.ajax({
        type: 'GET',
        url: baseURL + '/admin/location/states',
        success: function (resp) {
        }
    }).done(
    function (response) {
        let statesOptionsHTML = "<option selected> Select State </option> ";
        if (response?.states?.length > 0) {
            response.states.forEach(element => {
                statesOptionsHTML += `<option value="${element.state_id}"> ${element.state_name} </option>`
            	});
            	document.getElementById("states").innerHTML = statesOptionsHTML;
                }
            }).fail(function (data) {
        alert("failed");
    });
}

function play() {
    var audio = new Audio('files/alert_available.mp3');
    audio.play();
}
function playWait() {
    var audioWait = new Audio('files/alert_not_available.mp3');
    audioWait.play();
}
function playNoSlots() {
    var audioNoSlot = new Audio('files/alert_no_center.mp3');
    audioNoSlot.play();
}