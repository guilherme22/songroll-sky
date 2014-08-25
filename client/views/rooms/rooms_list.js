processRooms = function(array){
  rooms = array;
  rooms.forEach(function(item, i){
    var currentVideo = Videos.findOne({room_id: item._id, nowPlaying: true});
    if ( currentVideo ) {
      rooms[i].now_playing = currentVideo;
      rooms[i].room_image = currentVideo.image_url;
      if ( currentVideo.spotify_artist_id ) {
        var artistData = Cache.Spotify.findOne({spotify_artist_id: currentVideo.spotify_artist_id});
        if ( artistData ) {
          rooms[i].room_image = artistData.cacheData.images[0].url;
        } else {
          if ( localCache.spotifyArtists.indexOf(currentVideo.spotify_artist_id) == -1 ) {
            localCache.spotifyArtists.push(currentVideo.spotify_artist_id);
            localCacheDeps.spotifyArtists.changed();
          }
        }
      }
    }
  });
  return rooms;
}

Template.roomsList.helpers({
  rooms: function() {
    var rooms = Rooms.find({isPrivate: false, userCount: { $gt: 0 }}, { sort: { userCount: -1 } }).fetch();
    return processRooms(rooms);
  },
  roomsFiller: function(){
    var rooms = Rooms.find({isPrivate: false, userCount: { $gt: 0 }}, { sort: { userCount: -1 } }).count();
    var filler = [];
    if ( rooms < 9 ) {
      for (var i = 9 -rooms; i > 0; i--) {
        filler.push({index: i});
      };
    }
    if ( filler.length == 0 ) {
      filler.push({index: 1});
    } 
    return shuffleArray(filler);
  }
});

Template.roomsList.events({
  'click .room-item.room-item-filler': function(e){
    e.preventDefault();
    $('#createRoom').click(); 
  }
})