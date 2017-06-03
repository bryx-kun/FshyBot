const request   = require('request');
const Discord   = require('discord.js');
const config    = require('./config.json');
const lib       = require('./lib');

// Methods to export
class Commands {

  help(guildPrefix,message) {
    var desc = `
-- General
**${guildPrefix}help** - Displays all available commands
**${guildPrefix}ping** - Displays response time to server
**${guildPrefix}stats** - Displays bot usage statistics
**${guildPrefix}version** - Checks for updates to the bot
**${guildPrefix}invite** - Generates a link to invite 2B to your server

-- Admin | Requires user to have a role titled "Admin"
**${guildPrefix}setprefix [newprefix]** - Sets the prefix that the bot listens to

-- Music
**${guildPrefix}play [title/link]** - Searches and queues the given term/link
**${guildPrefix}stop** - Stops the current song and leaves the channel
**${guildPrefix}pause** - Pauses playback of the current song
**${guildPrefix}resume** - Resumes playback of the current song
**${guildPrefix}leave** - Stops any playback and leaves the channel
**${guildPrefix}stream [url]** - Plays a given audio stream, or file from direct URL
**${guildPrefix}radio** - Displays some available preprogrammed radio streams
**${guildPrefix}np** - Displays Now Playing info for radio streams

-- Anime/NSFW
**${guildPrefix}smug** - Posts a random smug reaction image
**${guildPrefix}lewd [search term]** - Uploads a random NSFW image of the term
**${guildPrefix}sfw  [search term]** - Uploads a random SFW image of the term
**${guildPrefix}tags [search term]** - Searches Danbooru for related search tags
**${guildPrefix}2B [nsfw]** - Uploads a 2B image, or a NSFW version if supplied

-- Misc
**${guildPrefix}crypto [coin] [amount]** - Displays current cryptocurrency price or calculated value (optional)
**${guildPrefix}calc [expression]** - Evaluates a given expression
**${guildPrefix}r    [subreddit]** - Uploads a random image from a given subreddit
**${guildPrefix}roll [n] [m]** - Rolls an n-sided die, m times and displays the result

-- Chatbot
2B answers her callsign in response to the user
Eg. 2B How are you? | 2B What's the time?

For source code and other dank memes check [GitHub](https://github.com/Fshy/FshyBot) | [arc.moe](http://arc.moe)`;
      message.channel.send({embed:new Discord.RichEmbed()
        .setTitle(`Commands:`)
        .setDescription(desc)
        .setImage('http://i.imgur.com/a96NGOY.png')
        .setColor(config.hexColour)});
  }

  ping(client,message){
    message.channel.send(lib.embed(`Response time to discord server: ${Math.round(client.ping)}ms`));
  }

  embed(guildPrefix,message) {
    var str = message.content.slice(guildPrefix.length+5);
    message.channel.send(lib.embed(str));
  }

  ver(version,guildPrefix,message) {
    request('https://raw.githubusercontent.com/Fshy/FshyBot/master/package.json', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed(`**ERROR:** Could not access repository`));
      }else {
        if (response.version!=version) {
          message.channel.send(lib.embed(`Currently Running v${version}\nNightly Build: v${response.version}\n\n:warning: *Use **${guildPrefix}update** to fetch master branch and restart bot | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`));
        }else {
          message.channel.send(lib.embed(`Currently Running v${version}\nNightly Build: v${response.version}\n\n:white_check_mark: *I'm fully updated to the latest build | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`));
        }
      }
    });
  }

  stats(version,client,message){
    message.channel.send({embed:new Discord.RichEmbed()
      .setTitle(`2B | FshyBot Statistics:`)
      .setDescription(`Currently serving **${client.users.size}** user${client.users.size>1 ? 's':''} on **${client.guilds.size}** guild${client.guilds.size>1 ? 's':''}`)
      .addField(`Ping`,`${Math.round(client.ping)}ms`,true)
      .addField(`Uptime`,`${parseInt(client.uptime/86400000)}:${parseInt(client.uptime/3600000)%24}:${parseInt(client.uptime/60000)%60}:${parseInt(client.uptime/1000)%60}`,true)
      .addField(`Build`,`v${version}`,true)
      .addField(`Memory Usage`,`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,true)
      .addField(`Platform`,`${process.platform}`,true)
      .addField(`Architecture`,`${process.arch}`,true)
      .setColor(config.hexColour)});
  }

  coin(args,message) {
    if (args[0]) {
      var currency = args[0].toUpperCase();
      request(`https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=USD`, function (error, response, body) {
        var price = JSON.parse(body).USD;
        if (error!=null) {
          message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`));
        }else {
          if (args[1]) {
            var amt = args[1];
            if (!isNaN(amt)) {
              request(`https://www.cryptocompare.com/api/data/coinlist`, function (error, response, body) {
                body = JSON.parse(body).Data;
                if (error!=null) {
                  message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`));
                }else {
                  for (var coin in body) {
                    if (body[coin].Name===currency) {
                      return message.channel.send({embed:new Discord.RichEmbed()
                        .setAuthor(`${body[coin].CoinName} (${body[coin].Name}) - $${price}`,`https://www.cryptocompare.com${body[coin].ImageUrl}`)
                        .setDescription(`${amt} ${body[coin].Name} = $${(price*parseFloat(amt)).toFixed(2)}`)
                        .setColor(config.hexColour)});
                    }
                  }
                  message.channel.send(lib.embed(`**ERROR:** ${currency} not found in database`));
                }
              });
            }else {
              message.channel.send(lib.embed(`**ERROR:** Parameter is not a number`));
            }
          }else {
            request(`https://www.cryptocompare.com/api/data/coinlist`, function (error, response, body) {
              body = JSON.parse(body).Data;
              if (error!=null) {
                message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`));
              }else {
                for (var coin in body) {
                  if (body[coin].Name===currency) {
                    return message.channel.send({embed:new Discord.RichEmbed()
                      .setAuthor(`${body[coin].CoinName} (${body[coin].Name}) - $${price}`,`https://www.cryptocompare.com${body[coin].ImageUrl}`)
                      .setColor(config.hexColour)});
                  }
                }
                message.channel.send(lib.embed(`**ERROR:** ${currency} not found in database`));
              }
            });
          }
        }
      });
    }else {
      request(`https://www.cryptocompare.com/api/data/coinlist`, function (error, response, body) {
        body = JSON.parse(body).Data;
        if (error!=null) {
          message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`));
        }else {
          var coinStack = [];
          for (var i = 0; coinStack.length < 10; i++) {
            for (var coin in body) {
              if (parseInt(body[coin].SortOrder)===i+1) {
                coinStack.push(body[coin]);
              }
            }
          }
          //
          var desc = [];
          for (var i = 0; i < coinStack.length; i++) {
            desc.push({name:'­', value:`${coinStack[i].Name}\t-\t${coinStack[i].CoinName}`});
          }
          message.channel.send({embed:{title: `Usage: !crypto [coin] or !crypto [coin] [amount]`, description:'Current Popular Cryptocurrencies:\n', fields: desc, color: 15514833}});
          //
        }
      });
    }
  }

  roll(args,message) {
    var res = 0;
    var sides = 6;
    var num = 1;
    var n;
    if (args[0]) {
      var sides = args[0];
      if (args[1]) {
        var num = args[1];
      }
    }
    var output = `Rolled a ${sides}-sided die ${num} times:\n`;
    for (var i = 0; i < num; i++) {
      n = Math.floor(Math.random() * sides) + 1;
      output += `[${n}] `;
      res += n;
    }
    output += "= "+res;
    message.channel.send(lib.embed(output));
  }

  danbooru(args,rating,amount,message) {
    var tag = args.join('_');
    if ((tag.toLowerCase().match(/kanna/g) && rating==='e') || (tag.toLowerCase().match(/kamui/g) && rating==='e'))
      return message.channel.send(lib.embed(`Don't lewd the dragon loli`));
    request(`http://danbooru.donmai.us/posts.json?tags=*${tag}*+rating%3A${rating}+limit%3A${amount}`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed(`**ERROR:** Could not access Danbooru API`));
      }else {
        var random = Math.floor(Math.random() * body.length);//Picks one randomly to post
        if (body[random]) {
          message.channel.send({embed:new Discord.RichEmbed()
            .setImage(`http://danbooru.donmai.us${body[random].file_url}`)
            .setDescription(`[Source](${body[random].source})`)
            .setColor(config.hexColour)});
        }else {
          message.channel.send(lib.embed(`**ERROR:** Could not find any posts matching ${tag}\nTry using the ${config.prefix}tags [search term] command to narrow down the search`));
        }
      }
    });
  }

  danbooruTags(args,message) {
    var tag = args.join('_');
    request(`http://danbooru.donmai.us/tags/autocomplete.json?search[name_matches]=*${tag}*`, function (e, r, b) {
      var suggestions = '';
      b = JSON.parse(b);
      if (b[0]!=null) {
        suggestions += 'Related tags:\n\n';
        for (var i = 0; i < b.length; i++) {
          suggestions += b[i].name;
          suggestions += '\n';
        }
      }else {
        suggestions = `No tags found for ${tag}`;
      }
      message.channel.send(lib.embed(suggestions));
    });
  }

  rslash(reddit,guildPrefix,message,args) {
    if (args[0]) {
      reddit.getSubreddit(args[0]).getHot().then(function (data) {
        if (data[0].url) {
          var urls = [];
          for (var i = 0; i < 25; i++) { //Top 25 sorted by Hot
            if ((/\.(jpe?g|png|gif|bmp)$/i).test(data[i].url)) { //If matches image file push to array
              urls.push(data[i]);
            }
          }
          if (urls.length!=0) {
            var random = Math.floor(Math.random() * urls.length);//Picks one randomly to post
            message.channel.send({embed:new Discord.RichEmbed()
            .setImage(urls[random].url)
            .setDescription(`${urls[random].title}\n[Source](http://reddit.com${urls[random].permalink})`)
            .setColor(config.hexColour)});
          }else {
            message.channel.send(lib.embed(`Sorry, no images could be found on r/${args[0]}`));
          }
        }
      }).catch(e =>{
        if (e.error) {
          message.channel.send(lib.embed(`**ERROR ${e.statusCode}:** ${e.error.message} - ${e.error.reason}`));
        }else {
          message.channel.send(lib.embed(`**ERROR:** No suitable posts were found on r/${args[0]}`));
        }
      });
    }else {
      message.channel.send(lib.embed(`**ERROR:** No subreddit specified | Use ${guildPrefix}r [subreddit]`));
    }
  }

  img2B(args,message){
    if(args[0]==='nsfw')
      this.danbooru([`yorha_no._2_type_b`],`e`,100,message);
    else
      this.danbooru([`yorha_no._2_type_b`],`s`,100,message);
  }

  setName(client,args,message){
    if (lib.checkOwner(message)) {
      if (args[0]) {
        var name = args.join(' ');
        client.user.setUsername(name).then(message.channel.send(lib.embed(`Name successfully updated!`)));
      }else {
        message.channel.send(lib.embed(`**ERROR:** Specify a string to change username to`));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`));
    }
  }

  setGame(timer,client,args,message){
    if (lib.checkOwner(message)) {
      clearInterval(timer);
      if (args[0]) {
        var game = args.join(' ');
        client.user.setGame(game).then(message.channel.send(lib.embed(`Game successfully updated!`)));
      }else {
        client.user.setGame(null).then(message.channel.send(lib.embed(`Game successfully cleared!`)));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`));
    }
  }

  setStatus(client,guildPrefix,args,message){
    if (lib.checkOwner(message)) {
      if (args[0]==='online' || args[0]==='idle' || args[0]==='invisible' || args[0]==='dnd') {
        client.user.setStatus(args[0]).then(message.channel.send(lib.embed(`Status successfully updated!`)));
      }else {
        message.channel.send(lib.embed(`**ERROR:** Incorrect syntax | Use ${guildPrefix}setstatus [status]\nStatuses: online, idle, invisible, dnd`));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`));
    }
  }

  setAvatar(client,args,message){
    if (lib.checkOwner(message)) {
      if ((/\.(jpe?g|png|gif|bmp)$/i).test(args[0])) {
        client.user.setAvatar(args[0]).then(message.channel.send(lib.embed(`Avatar successfully updated!`)));
      }else {
        message.channel.send(lib.embed(`**ERROR:** That's not an image filetype I recognize | Try: .jpg .png .gif .bmp`));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`));
    }
  }

  calc(math,args,message){
    var expr = args.join(' ');
    if (args[0]) {
      try {
        message.channel.send(lib.embed(`${expr} = ${math.eval(expr)}`));
      } catch (e) {
        message.channel.send(lib.embed(`**ERROR:** ${e.message}`));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Enter an expression to evaluate`));
    }
  }

  update(message){
    if (lib.checkOwner(message)) {
      message.channel.send(lib.embed(`Updating...`));
      lib.series([
        'git fetch',
        'git reset --hard origin/master',
        'npm install',
        'pm2 restart all'
      ], function(err){
        if (err) {
          console.log(err.message);
        }
      });
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`));
    }
  }

  chatbot(args,message){
    var expr = args.join(' ');
    request({url:`https://jeannie.p.mashape.com/api?input=${expr}`,headers: {'X-Mashape-Key': config.mashape.jeannie,'Accept': 'application/json'}}, function (error, response, body) {
      if (error!=null) {
        message.reply(lib.embed(`**ERROR:** Could not access Jeannie API`));
      }else {
        response = JSON.parse(body);
        message.reply(response.output[0].actions.say.text.substring(0, 2000));
      }
    });
  }

  play(ytdl,guildsMap,client,args,message){
    const voiceChannel = message.member.voiceChannel;
    var controls = this.controls;
    if (!voiceChannel) {
      message.channel.send(lib.embed(`**ERROR:** Please join a voice channel first`));
    }else {
      let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = args[0].match(regExp);
      if (match) {
        request(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${match[2]}&key=${config.youtube.apiKey}`, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`));
          }else {
            response = JSON.parse(body);
            let res = response.items[0];
            let stream = ytdl(match[2], {
              filter : 'audioonly'
            });
            let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
            if (vconnec) {
              let dispatch = vconnec.player.dispatcher;
              if (dispatch)
                dispatch.end();
            }
            client.setTimeout(function () {
              voiceChannel.join().then(connnection => {
                var dispatcher = connnection.playStream(stream, {passes:2});
                message.channel.send({embed:new Discord.RichEmbed()
                  .setDescription(`:headphones: Now Playing: ${res.snippet.title}`)
                  .setThumbnail(res.snippet.thumbnails.default.url)
                  .setColor(config.hexColour)}).then(m =>{
                    controls(guildsMap,client,m);
                  });
                dispatcher.on('end', () => {
                  client.removeAllListeners('messageReactionAdd');
                  client.removeAllListeners('messageReactionRemove');
                  // voiceChannel.leave();
                });
              })
            }, 250);
          }
        });
      }else {
        let expr = args.join('+');
        request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${expr}&type=video&videoCategoryId=10&key=${config.youtube.apiKey}`, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`));
          }else {
            response = JSON.parse(body);
            let res = response.items[0];
            let stream = ytdl(res.id.videoId, {
              filter : 'audioonly'
            });
            let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
            if (vconnec) {
              let dispatch = vconnec.player.dispatcher;
              if (dispatch)
                dispatch.end();
            }
            client.setTimeout(function () {
              voiceChannel.join().then(connnection => {
                var dispatcher = connnection.playStream(stream, {passes:2});
                message.channel.send({embed:new Discord.RichEmbed()
                  .setDescription(`:headphones: Now Playing: ${res.snippet.title}`)
                  .setThumbnail(res.snippet.thumbnails.default.url)
                  .setColor(config.hexColour)}).then(m =>{
                    controls(guildsMap,client,m);
                  });
                dispatcher.on('end', () => {
                  client.removeAllListeners('messageReactionAdd');
                  client.removeAllListeners('messageReactionRemove');
                  // voiceChannel.leave();
                });
              })
            }, 250);
          }
        });
      }
    }
  }

  stream(client,args,message){
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.send(lib.embed(`**ERROR:** Please join a voice channel first`));
    }else {
      if (args[0]) {
        let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
        if (vconnec) {
          let dispatch = vconnec.player.dispatcher;
          if (dispatch)
            dispatch.end();
        }
        if (args[0].startsWith('https')) {
          require('https').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              connnection.playStream(res, {passes:2});
              dispatcher.on('end', () => {
                // voiceChannel.leave();
              });
            });
          });
        }else {
          require('http').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              connnection.playStream(res, {passes:2});
              dispatcher.on('end', () => {
                // voiceChannel.leave();
              });
            });
          });
        }
      }else {
        message.channel.send(lib.embed(`**ERROR:** Please specify the stream url as a parameter`));
      }
    }
  }

  stop(guildsMap,client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.end();
      var np = guildsMap.get(message.guild.id);
      delete np.playing;
      guildsMap.set(message.guild.id, np);
      // message.channel.send(lib.embed(`:mute: ${message.author.username} Stopped Playback`));
    }
  }

  leave(guildsMap,client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.end();
      var np = guildsMap.get(message.guild.id);
      delete np.playing;
      guildsMap.set(message.guild.id, np);
      vconnec.channel.leave();
    }
  }

  pause(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.pause();
      // message.channel.send(lib.embed(`:speaker: ${message.author.username} Paused Playback`));
    }
  }

  resume(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.resume();
      // message.channel.send(lib.embed(`:loud_sound: ${message.author.username} Resumed Playback`));
    }
  }

  radio(client,guildPrefix,guildsMap,args,message){
    var stream = this.stream;
    if (args[0]) {
      var choice = parseInt(args[0])-1;
      if (choice<config.radio.length) {
        request(`https://feed.tunein.com/profiles/${config.radio[choice].tuneinId}/nowPlaying`, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access TuneIn API`));
          }else {
            body = JSON.parse(body);
            stream(client,[config.radio[choice].url],message);
            var guildData = guildsMap.get(message.guild.id);
            guildData.playing = config.radio[choice].tuneinId;
            guildsMap.set(message.guild.id,guildData);
            message.channel.send({embed:new Discord.RichEmbed()
              .setDescription(`:headphones: **Now Streaming:** ${config.radio[choice].title}\n${body.Secondary ? `**Currently Playing:** ${body.Secondary.Title}`:''}`)
              .setThumbnail(body.Primary.Image)
              .setColor(config.hexColour)});
          }
        });
      }else {
        message.channel.send(lib.embed(`**ERROR:** Selection does not exist`));
      }
    }else {
      var desc = [];
      for (var i = 0; i < config.radio.length; i++) {
        if (i===0) {
          desc.push({name:'Command',        value:`${guildPrefix}radio ${i+1}`,            inline:true});
          desc.push({name:'Radio Station',  value:`${config.radio[i].title}`, inline:true});
          desc.push({name:'Genre',          value:`${config.radio[i].genre}`, inline:true});
        }else {
          desc.push({name:'­', value:`${guildPrefix}radio ${i+1}`,             inline:true});
          desc.push({name:'­', value:`${config.radio[i].title}`,  inline:true});
          desc.push({name:'­', value:`${config.radio[i].genre}`,  inline:true});
        }
      }
      message.channel.send({embed:{title: `:radio: Programmed Stations:`, description:'\n', fields: desc, color: 15514833}});
    }
  }

  nowPlaying(guildsMap,message){
    var np = guildsMap.get(message.guild.id).playing;
    if (np) {
      request(`https://feed.tunein.com/profiles/${np}/nowPlaying`, function (error, response, body) {
        if (error!=null) {
          message.channel.send(lib.embed(`**ERROR:** Could not access TuneIn API`));
        }else {
          body = JSON.parse(body);
          message.channel.send({embed:new Discord.RichEmbed()
            .setDescription(`${body.Secondary ? `**Currently Playing:** ${body.Secondary.Title}`:'No ID3 Tags found for this stream'}`)
            .setThumbnail(body.Secondary ? body.Secondary.Image:'')
            .setColor(config.hexColour)});
        }
      });
    }else {
      message.channel.send(lib.embed(`**ERROR:** No streaming data could be found`));
    }
  }

  smug(message){
    request(`http://arc.moe/smug`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed('**ERROR:** Could not access arc.moe resource'));
      }else {
        var random = Math.floor(Math.random() * body.length);//Picks one randomly to post
        if (body[random]) {
          message.channel.send({embed:new Discord.RichEmbed()
            .setImage(`${body[random]}`)
            .setColor(config.hexColour)});
        }else {
          message.channel.send(lib.embed(`**ERROR:** Could not find the image requested`));
        }
      }
    });
  }

  invite(client,message){
    client.generateInvite(8).then(link => {
      message.channel.send({embed:new Discord.RichEmbed()
        .setDescription(`You can use this [LINK](${link}) to invite me to your server! :sparkling_heart:`)
        .setColor(config.hexColour)});
    });
  }

  setprefix(guildDB,guildsMap,guildPrefix,args,message){
    if (message.guild.roles.exists('name', 'Admin')) {
      var newprefix = args.join('');
      if(newprefix){
        var admins = message.guild.roles.find('name', 'Admin').members;
        if (admins.has(message.author.id)) {
          // set the prefix here
          guildDB.once("value", (data) => {
            var guilds = data.val();
            if (guilds) {
              var keys = Object.keys(guilds);
              for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (guilds[key].id===message.guild.id) {
                  guildDB.child(key).update({"prefix": newprefix});
                  guildsMap.set(message.guild.id,{prefix:newprefix});
                  message.channel.send(lib.embed(`**SUCCESS:** Now listening for the prefix: \`${newprefix}\``));
                  break;
                }
              }
            }
          });
          // end prefix
        }else {
          message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command\n**Required Role:** \`Admin\``));
        }
      }else {
        message.channel.send(lib.embed(`**ERROR:** Failed to specify a parameter, i.e. ${guildPrefix}setprefix [newprefix]`));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Guild must have a role titled \`Admin\` to use this command`));
    }
  }

  controls(guildsMap,client,message){

    function leave(guildsMap,client,message){
      let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
      if (vconnec) {
        let dispatch = vconnec.player.dispatcher;
        if (dispatch)
          dispatch.end();
        var np = guildsMap.get(message.guild.id);
        delete np.playing;
        guildsMap.set(message.guild.id, np);
        vconnec.channel.leave();
      }
    }

    function stop(guildsMap,client,message) {
      let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
      if (vconnec) {
        let dispatch = vconnec.player.dispatcher;
        if (dispatch)
          dispatch.end();
        var np = guildsMap.get(message.guild.id);
        delete np.playing;
        guildsMap.set(message.guild.id, np);
      }
    }
    message.react('⏯').then(r => {
      // playpause
      client.on('messageReactionAdd', (messageReaction)=>{
        if (messageReaction===r && messageReaction.count>2){
          let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
          if (vconnec) {
            let dispatch = vconnec.player.dispatcher;
            if (dispatch){
              if (dispatch.speaking)
                dispatch.pause();
              else
                dispatch.resume();
            }
          }
        } //this.resume(client,message);
      });
      client.on('messageReactionRemove', (messageReaction)=>{
        if (messageReaction===r){
          let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
          if (vconnec) {
            let dispatch = vconnec.player.dispatcher;
            if (dispatch){
              if (dispatch.speaking)
                dispatch.pause();
              else
                dispatch.resume();
            }
          }
        }// this.resume(client,message);
      });
        message.react('⏹').then(r => {
          // stop
          client.on('messageReactionAdd', (messageReaction)=>{
            if (messageReaction===r && messageReaction.count>2) stop(guildsMap,client,message);
          });
          client.on('messageReactionRemove', (messageReaction)=>{
            if (messageReaction===r) stop(guildsMap,client,message);
          });
          message.react('❌').then(r => {
            //close
            client.on('messageReactionAdd', (messageReaction)=>{
              if (messageReaction===r && messageReaction.count>2) leave(guildsMap,client,message);
            });
            client.on('messageReactionRemove', (messageReaction)=>{
              if (messageReaction===r) leave(guildsMap,client,message);
            });
          })
        })
    })
  }

  insta(args,message){
    if (args[0]) {
      const instagramPosts = require('instagram-posts');
      instagramPosts(args[0],{
      	filter: data => data.type === 'image'
      }).then(posts => {
        if (posts[0]) {
          message.channel.send({embed:new Discord.RichEmbed()
            .setAuthor(`@${posts[0].username}`)
            .setDescription(`https://www.instagram.com/p/${posts[0].id}\n${posts[0].text}`)
            .setImage(posts[0].media)
            .setColor(config.hexColour)});
        }else {
          message.channel.send(lib.embed(`**ERROR:** Could not retrieve any images for @${args[0]}`));
        }
      });
    }else {
      message.channel.send(lib.embed(`**Usage:** !insta [username]`));
    }
  }

  pubg(scraper,args,message){
    if (args[0]) {
      scraper(`https://pubg.me/player/${args[0]}`, {
          username: ".username-header h1",
          avatar: {
            selector: ".steam-avatar",
            attr: "src"
          },
          soloRating: ".profile-match-overview-solo .stat-blue .value",
          soloKD: ".profile-match-overview-solo .stat-red .value",
          duoRating: ".profile-match-overview-duo .stat-blue .value",
          duoKD: ".profile-match-overview-duo .stat-red .value",
          squadRating: ".profile-match-overview-squad .stat-blue .value",
          squadKD: ".profile-match-overview-squad .stat-red .value"
      }).then(stats => {
          if (stats.username) {
            message.channel.send({embed:new Discord.RichEmbed()
              .setAuthor(`PUBG.ME | ${stats.username}`,stats.avatar)
              .addField(`Solo`,`${stats.soloRating ? `${stats.soloRating}`:'N/A'} Rating`,true)
              .addField(`Duo`,`${stats.duoRating ? `${stats.duoRating}`:'N/A'} Rating`,true)
              .addField(`Squad`,`${stats.squadRating ? `${stats.squadRating}`:'N/A'} Rating`,true)
              .addField('­',`${stats.soloKD ? `${stats.soloKD}`:'0.00'} K/D`,true)
              .addField('­',`${stats.duoKD ? `${stats.duoKD}`:'0.00'} K/D`,true)
              .addField('­',`${stats.squadKD ? `${stats.squadKD}`:'0.00'} K/D`,true)
              .setColor(config.hexColour)});
          }else {
            message.channel.send(lib.embed(`**ERROR:** Could not retrieve stats for ${args[0]}`));
          }
      });
    }else {
      message.channel.send(lib.embed(`**Usage:** !pubg [username]`));
    }
  }

//   leagueoflegends(args,message){
//     if (args[0]) {
//       if (args[1]) {
//         request(`https://${args[1]}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${args[0]}?api_key=${config.riot.apiKey}`, function (error, response, body) {
//           let summoner = JSON.parse(body);
//           if (error!=null) {
//             message.channel.send(lib.embed('**ERROR:** Could not access Riot API'));
//           }else {
//             request(`https://${args[1]}.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/${summoner.id}?api_key=${config.riot.apiKey}`, function (error, response, body) {
//               let game = JSON.parse(body);
//               if (error!=null) {
//                 message.channel.send(lib.embed('**ERROR:** Could not access Riot API'));
//               }else {
//                 if (game.status) {
//                   return message.channel.send(lib.embed('Live game stats could not be found for that user'));
//                 }else {
//                   request(`http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json`, function (error, response, body) {
//                     let champions = JSON.parse(body);
//                     if (error!=null) {
//                       message.channel.send(lib.embed('**ERROR:** Could not access Champion API'));
//                     }else {
//                       for (var i = 0; i < game.participants.length; i++) {
//                           let playerInfo = ``;
//                           if (game.participants[i].teamId===100)
//                             playerInfo += `Blue Team - `;
//                           else
//                             playerInfo += `Red Team - `;
//                           playerInfo += `${game.participants[i].summonerName} | `;
//                           let champId = game.participants[i].championId;
//                           request(`https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/${summoner.id}/ranked?api_key=${config.riot.apiKey}`, function (error, response, body) {
//                             var summonerInfo = JSON.parse(body);
//                             for (var champ in champions.data) {
//                                 if (champions.data[champ].key==champId)
//                                   playerInfo += `${champ} `;
//                                   break;
//                             }
//                             Object.keys(summonerInfo).forEach(function(key) {
//                               if (summonerInfo.champions[key]==champId) {
//                                 console.log(champId);
//                               }
//                               // console.log(key, summonerInfo[key]);
//                             });
//                             // for (var champStats in summonerInfo.champions) {
//                             //   if (summonerInfo.champions[champStats].id==champId){
//                             //     var stats = summonerInfo.champions[champStats].stats;
//                             //     playerInfo += `${stats.totalSessionsWon}W/${stats.totalSessionsLost}L (${((stats.totalSessionsWon/stats.totalSessionsPlayed)*100).toFixed(1)}%) | `;
//                             //     break;
//                             //   }
//                             // }
//                             // for (var cs in summonerInfo.champions) {
//                             //   if (summonerInfo.champions[cs].id===0){
//                             //     var s = summonerInfo.champions[cs].stats;
//                             //     playerInfo += `Overall ${s.totalSessionsWon}W/${s.totalSessionsLost}L (${((s.totalSessionsWon/s.totalSessionsPlayed)*100).toFixed(1)}%)`;
//                             //     break;
//                             //   }
//                             // }
//                             console.log(playerInfo);
//                             // console.log(summonerInfo.champions);
//                             // console.log(`Overall ${summonerInfo.champions}`);
//                           });
//
//                       }
//                     }
//                   });
//                 }
//               }
//             });
//           }
//         });
//       }else {
//         message.channel.send(lib.embed(`
// **ERROR:** Missing Parameter
// Use !lol [Username] [Server Code]
//
// **Server List:**
// North America - NA1
// Europe West - EUW1
// Europe Nordic & East - EUN1
// Latin America North - LA1
// Latin America South - LA2
// Oceania - OC1
// Korea - KR
// Japan - JP1`
//         ));
//       }
//     }else {
//       message.channel.send(lib.embed(`
// **ERROR:** Missing Parameter
// Use !lol [Username] [Server Code]
//
// **Server List:**
// North America - NA1
// Europe West - EUW1
// Europe Nordic & East - EUN1
// Latin America North - LA1
// Latin America South - LA2
// Oceania - OC1
// Korea - KR
// Japan - JP1`
//       ));
//     }
//   }

}

module.exports = new Commands();
