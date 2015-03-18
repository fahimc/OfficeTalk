(function(){
	var Main=
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
			this.setListeners();
			var muteButton = document.getElementById('muteButton');
			var speakerButton = document.getElementById('speakerButton');
			this.audioHolder = document.getElementById('audioHolder');
			this.usersHolder = document.getElementById('users');
			this.groupsHolder= document.getElementById('rooms-list');
			var connection = this.connection = new RTCMultiConnection();


			connection.session = {
				audio: true
			};

			connection.sdpConstraints.mandatory = {
				OfferToReceiveAudio: true,
				OfferToReceiveVideo: false
			};

			connection.onstream =this.onUserConnected.bind(this);
			connection.onstreamended =this.onUserDisconnected.bind(this);
			connection.onNewSession = this.onGroupList.bind(this);
			connection.onSessionClosed = this.onGroupClosed.bind(this);
			console.log("loaded",connection);

			

			
			var muted=false;
			var remoteMute=false;
			function onMuteClicked(){
				if(!muted)
				{
					connection.streams.mute({
						audio: true,
						type: 'local'
					});
					muted=true;
				}else{
					connection.streams.unmute({
						audio: true,
						type: 'local'
					});
					muted=false;
				}
			}
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

			muteButton.addEventListener('click',onMuteClicked);
			speakerButton.addEventListener('click',onRemoteMuteClicked);
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
    	if (this.sessions[session.sessionid]) return;
    	this.sessions[session.sessionid] = session;

    	var tr = document.createElement('tr');
    	tr.innerHTML = '<td>' + session.extra['session-name'] + '</td>' +
    	'<td><button class="join">Join</button></td>';
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
    },
    onUserConnected:function(event){
    	if(event.extra.username){
    		var li = document.createElement('LI');
    		li.innerHTML=event.extra.username;
    		this.usersHolder.appendChild(li);
    	}
    	
    	console.log(event.extra.username);
    	this.audioHolder.insertBefore(event.mediaElement, this.audioHolder.firstChild);
    }
};
Main.init();
})();