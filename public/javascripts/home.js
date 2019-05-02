
var example = "DPP:C:81/1;M:2c:d0:5a:6e:ca:3c;I:ABCDE;K:MDkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDIgAC/nFQKV1+CErzr6QCUT0jFIno3CaTRr3BW2n0ThU4mAw=;;"


var chan = "81/1";
var mac = "2c:d0:5a:6e:ca:3c";
var dpp_role = "sta";
var key = "MDkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDIgAC/nFQKV1+CErzr6QCUT0jFIno3CaTRr3BW2n0ThU4mAw=";
var vendor = "KYZRQ";
var connectWait = true;
var uri;

function uri_component( token, value) {
	var component = token;
	component += ':';
	component += value;
	component += ';';
	return component;
}

function onboard() {

	console.log("onboard()");

	uri = "DPP:";
	uri += uri_component( 'C', chan );
	uri += uri_component( 'M', mac );
	uri += uri_component( 'I', vendor );
	uri += uri_component( 'K', key );
	uri += ';';

	var message = {
		"uri": uri,
		"role": "sta",
		"connectWait": connectWait
	};

	$.ajax({
	    url: 'onboard',
	    dataType: 'json',
	    type: 'post',
	    contentType: 'application/json',
	    //data: JSON.stringify( { "first-name": $('#first-name').val(), "last-name": $('#last-name').val() } ),
	    data: JSON.stringify(message),
	    processData: false,
	    success: function( data, textStatus, jQxhr ){
	        $('#response pre').html(JSON.stringify(data));
	        console.log("rxed data: "+JSON.stringify(data));
	    },
	    error: function( jqXhr, textStatus, errorThrown ){
	        console.log(errorThrown);
	        console.log("textStatus: "+textStatus);
	        console.log("jqXhr: "+JSON.stringify(jqXhr));
	    }
	});
}