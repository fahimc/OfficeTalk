(function(){
	var Main=window.Main=
	{
		username:'',
		userCollections:[],
		audioHolder:null,
		usersHolder:null,
		groupsHolder:null,
		connection:null,
		sessions:{},
		init:function(){
			console.log("init")
			document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
		},
		onLoad:function(){
			window.skipRTCMultiConnectionLogs = true;
			this.setListeners();
			var muteButton = document.getElementById('muteButton');
			var speakerButton = document.getElementById('speakerButton');
			this.audioHolder = document.getElementById('audioHolder');
			this.usersHolder = document.getElementById('users');
			this.groupsHolder= document.getElementById('rooms-list');
			var connection = this.connection = new RTCMultiConnection('OfficeTalk');
			connection.dontOverrideSession = true;

			connection.session = {
				audio: true
			};

			connection.sdpConstraints.mandatory = {
				OfferToReceiveAudio: true,
				OfferToReceiveVideo: false
			};
			connection.transmitRoomOnce = false;
			connection.isAcceptNewSession = true;
			 //connection.keepStreamsOpened = true;
			 connection.onstream =this.onUserConnected.bind(this);
			 connection.onstreamended =this.onUserDisconnected.bind(this);
			 connection.onNewSession = this.onGroupList.bind(this);
			 connection.onSessionClosed = this.onGroupClosed.bind(this);
			 connection.log = false;
			 console.log("loaded",connection);




			 var muted=false;
			 var remoteMute=false;

			 function onRemoteMuteClicked(){
			 	if(!remoteMute)
			 	{
			 		connection.streams.mute({
			 			audio: true,
			 			type: 'remote'
			 		});
			 		remoteMute=true;
			 	}else{
			 		connection.streams.unmute({
			 			audio: true,
			 			type: 'remote'
			 		});
			 		remoteMute=false;
			 	}
			 }

			 //muteButton.addEventListener('click',onMuteClicked);
			 //speakerButton.addEventListener('click',onRemoteMuteClicked);
        // setup signaling to search existing sessions
        connection.connect();

    },
    setListeners:function(){
    	document.getElementById('nextButton').addEventListener('click',this.onNextClicked.bind(this));
    	document.getElementById('setup-new-conference').addEventListener('click',this.onCreateGroup.bind(this));
    },
    onNextClicked:function(){
    	var value = document.getElementById('username').value;
    	if(!value){
    		document.getElementById('usernameError').innerHTML="Please enter a username"
    	}else{
    		this.username =value;
    		document.querySelector(".view.user").classList.remove("show");
    		document.querySelector(".view.groups").classList.add("show");
    	}
    },
    onJoinGroup:function(event){
    	var sessionid = event.target.getAttribute('data-sessionid');
    	session = this.sessions[sessionid];

    	if (!session) throw 'No such session exists.';
    	this.connection.extra={
    		'username':this.username
    	}
    	this.connection.join(session);
    	document.querySelector(".view.groups").classList.remove("show");
    	document.querySelector(".view.session").classList.add("show");
    },
    onGroupList:function(session){
    	console.log('onGroupList',session);
    	if (this.sessions[session.sessionid]) return;
    	this.sessions[session.sessionid] = session;

    	var tr = document.createElement('tr');
    	tr.innerHTML = '<td>' + session.extra['session-name'] + '</td>' +
    	'<td><button class="join btn btn-primary">Join</button></td>';
    	this.groupsHolder.insertBefore(tr, this.groupsHolder.firstChild);

    	var joinRoomButton = tr.querySelector('.join');
    	joinRoomButton.setAttribute('data-sessionid', session.sessionid);
    	joinRoomButton.onclick = this.onJoinGroup.bind(this);
    },
    onGroupClosed:function(event){
    	console.log("onGroupClosed",event);
    },
    onCreateGroup:function(){
    	this.connection.extra = {
    		'username':this.username,
    		'session-name': document.getElementById('conference-name').value || 'Anonymous'
    	};
    	this.connection.open();
    	document.querySelector(".view.groups").classList.remove("show");
    	document.querySelector(".view.session").classList.add("show");
    },
    onUserDisconnected:function(event){
    	console.log("onUserDisconnected",event);
    	if(this.userCollections[event.userid]){
    		var li = this.userCollections[event.userid].element;
    		var mediaElement =document.querySelector('media-userid');
    		this.usersHolder.removeChild(li);
    		if(li)this.usersHolder.removeChild(mediaElement);
    		if(mediaElement)this.userCollections[event.userid]=null;
    		console.log("removed");
    	}
    },
    createUserLI:function(name,id){
    	var li = document.createElement('LI');
    	li.className="participant-row";
    	li.setAttribute('userid',id);
    	li.innerHTML='<span>'+name+'</span>'+
    	'<i class="icon-mic" onclick="Main.onMuteClicked(this)" user-id="'+id+'"></i>'
    	this.usersHolder.appendChild(li);

    	return li;
    },
    onMuteClicked:function(element){
    	var id =element.getAttribute('user-id');
    	var user =this.userCollections[id];
    	console.log(user);
    	if(!user)return;
    	if(!user.muted)
    	{

    		user.data.rtcMultiConnection.streams.mute({
    			audio: true,
    			type: 'local'
    		});
    		user.muted=true;
    		element.classList.remove("icon-mic");
    		element.classList.add("icon-mic-off");
    	}else{
    		user.data.rtcMultiConnection.streams.unmute({
    			audio: true,
    			type: 'local'
    		});
    		user.muted=false;
    		element.classList.remove("icon-mic-off");
    		element.classList.add("icon-mic");
    	}

    },
    onUserConnected:function(event){
    	if(event.extra.username){
    		
    		var li = this.createUserLI(event.extra.username,event.userid);
    		this.userCollections[event.userid]={
    			data:event,
    			element:li,
    			mediaElement:event.mediaElement,
    			muted:false
    		};
    	}
    	if(event.type == 'remote')
    	{
    		this.connection.isAcceptNewSession = true;
    		this.connection.askToShareParticipants();
    	}
    	if (this.connection.isInitiator && event.type == 'remote' ) {
                    // call "shareParticipants" to manually share participants with all connected users!
                    this.connection.shareParticipants({
                    	dontShareWith: event.userid
                    });
                }
                console.log('onUserConnected',event);
                event.mediaElement.setAttribute('media-userid',event.userid);
                this.audioHolder.insertBefore(event.mediaElement, this.audioHolder.firstChild);
            }
        };
        Main.init();
    })();