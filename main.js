Game.onload = function(){
	let screen = new Screen('logs_screen', "100%", "100%", true, false);
	Game.screen.add(screen);
	let style = new CssStyle("logs_table", "id", [
		{"property" : "height", "value" : "300px"},
		{"property" : "overflow-y", "value" : "scroll"},
		{"property" : "pointer-events", "value" : "auto"},
		{"property" : "position", "value" : "absolute"},
		{"property" : "right", "value" : "10px"},
		{"property" : "width", "value" : "600px"},
		{"property" : "background", "value" : "#1f1b1bc7"},
		{"property" : "top", "value" : "70px"},
		{"property" : "padding", "value" : "10px"},
		{"property" : "border-radius", "value" : "10px"}
	]);
	let style_2 = new CssStyle("logs_table .log", "id", [
		{"property" : "font-size", "value" : "12px"},
		{"property" : "color", "value" : "white"},
		{"property" : "margin-left", "value" : "5px"}
	]);
	let style_3 = new CssStyle("logs_table .log div", "id", [
		{"property" : "display", "value" : "inline"},
		{"property" : "font-size", "value" : "10px"},
		{"property" : "font-family", "value" : "sans-serif"},
		{"property" : "color", "value" : "#888"},
		{"property" : "border-left", "value" : "#292929 solid"},
		{"property" : "padding-left", "value" : "5px"}
	]);
	Game.css.add(style);
	Game.css.add(style_2);
	Game.css.add(style_3);
}

Game.afterdraw = function(){
	$("#frame_logs_screen").html(`<div id="logs_table" class="temp_290r0ddw"></div><button style="pointer-events: auto;width: 20px;height: 60px;position: absolute;bottom: 100px;background: #21131394;border: 2px #190b0bc7 solid;" onclick="RunFromGlobal('treaty_logger','ToggleOpen');" id="logger_open_button"></button>`);
	Game.functions.ToggleOpen();
	Game.functions.Update();
}

Game.global_vars = {
	"past_logs" : [],
	"objects_active" : [],
	"objects_offered" : [],
}

Game.functions = {
	LoadDat : function(){

	},
	ToggleOpen : function(){
		if($("#frame_logs_screen #logs_table").hasClass("hidden")){
			$("#frame_logs_screen #logs_table").show();
			$("#frame_logs_screen #logs_table").removeClass("hidden");
		}else{
			$("#frame_logs_screen #logs_table").hide();
			$("#frame_logs_screen #logs_table").addClass("hidden");
		}
	},
	SaveDat : function(){

	},

	Update : function(){
		let new_log_objects = [];
		let all_ids_offer = [];
		let all_ids_active = [];
		let all_offer_objects = [];
		let all_active_objects = [];
		for(h in Game.global_vars.objects_active){
			all_ids_active.push(Game.global_vars.objects_active[h].id);
		}

		for(h in Game.global_vars.objects_offered){
			all_ids_offer.push(Game.global_vars.objects_offered[h].id);
		}

		for(h in modAPI.treaties.active){
			all_active_objects.push(modAPI.treaties.active[h]);
			if(all_ids_active.indexOf(modAPI.treaties.active[h].id)!=-1) continue;
			let send_dat = modAPI.treaties.active[h];
			
			send_dat.role_type = "active";
			new_log_objects.push(send_dat);
		}

		for(h in modAPI.treaties.offer){
			all_offer_objects.push(modAPI.treaties.offer[h]);
			if(all_ids_offer.indexOf(modAPI.treaties.offer[h].id)!=-1) continue;
			let send_dat = modAPI.treaties.offer[h];
			send_dat.role_type = "offer";
			new_log_objects.push(send_dat);
		}

		Game.global_vars.objects_active = all_active_objects;
		Game.global_vars.objects_offered = all_offer_objects;
		new_log_objects = Game.functions.CullDuplicates(new_log_objects);
		new_log_objects = Game.functions.SortTreatiesByDate(new_log_objects);
		let name_lookup_table = {};
		for(h in modAPI.other_nations){
			name_lookup_table[modAPI.other_nations[h].id] = modAPI.other_nations[h].name;
		}
		Game.global_vars.past_logs = Game.global_vars.past_logs.concat(function(){
			return new_log_objects.map(function(object){
				return {
					"type" : object.type,
					"offer_type" : object.role_type,
					"player_reciever" : (name_lookup_table[object.reciever_id] == undefined) ? "a Player" : name_lookup_table[object.reciever_id],
					"player_sender" : (name_lookup_table[object.sender_id] == undefined) ? "You" : name_lookup_table[object.sender_id],
					"time" : object.date.signed
				}
			})
		}());

		Game.functions.RefreshLogs();
	},

	RefreshLogs : function(){
		$("#logs_table").html(function(){
			let innerHTML = "";
			let timestamp = new Date();
			let date = timestamp.getTime();
			let role_dict = {
				"offer" : ["offered a","to"],
				"active" : ["declared a","on"]
			}
			for(dat of Game.global_vars.past_logs){
				innerHTML+= `<div class="log"> ${dat.player_sender} has ${role_dict[dat.offer_type][0]} ${ dat.type } ${role_dict[dat.offer_type][1]} ${dat.player_reciever} <div>`;
				let time_diff = (date - dat.time)/ 1000;
				let days = Math.floor(time_diff / 86400);
				let hours = Math.floor( (time_diff % 86400) / 3600) - (Math.floor(timestamp.getTimezoneOffset() / 60) - 3);
				let minutes = Math.floor( (time_diff % 3600) / 60) - Math.floor(timestamp.getTimezoneOffset() % 60 + 3);

				if(dat.time == 0){
					innerHTML+= " Before The Era";
				}else{
					if(days > 0){
						innerHTML+= " " + days+ " Day" + ((days > 1) ? "s" : "");
						if(hours > 0){
						innerHTML+= " " + hours + " Hour" + ((hours > 1) ? "s" : "");
						}
						if(minutes > 0){
							innerHTML+= " " + minutes + " Minute" + ((minutes > 1) ? "s" : "");
						}
						innerHTML+= " Ago";
					}else if(hours < 1 && minutes < 1){
						innerHTML+= " Just Now"
					}else{
						if(hours > 0){
						innerHTML+= " " + hours + " Hour" + ((hours > 1) ? "s" : "");
						}
						if(minutes > 0){
							innerHTML+= " " + minutes + " Minute" + ((minutes > 1) ? "s" : "");
						}
						innerHTML+= " Ago";
					}
					

					
					
				}
				innerHTML+=`</div></div>`;
			}

			return innerHTML;
		}());
	},

	CullDuplicates : function(treaties){
		let items = [];
		let keys = [];

		for( h in treaties ){
			if(keys.indexOf(treaties[h].id)!=-1) continue;
			items.push(treaties[h]);
			keys.push(treaties[h].id);
		}
		return items;
	},

	SortTreatiesByDate : function(treaties){
		let items = treaties;

		let swap = function(item, leftIndex, rightIndex){
			let temp = items[leftIndex];
			items[leftIndex] = items[rightIndex];
			items[rightIndex] = temp;
		}

		let partition = function(items, left, right){
			let pivot = items[Math.floor((right + left) / 2)].date.signed;
			i = left, j = right;
			while ( i <= j ){
				while( items[i].date.signed  < pivot){
					i++;
				}
				while(items[j].date.signed > pivot){
					j--;
				}
				if(i <= j){
					swap( items, i, j);
					i++;
					j--;
				}
			}
			return i;
		}


		let quicksort = function(items, left, right){
			let index;
			if(items.length > 1){
				index = partition(items, left, right);
				if(left < index - 1){
					quicksort(items, left, index - 1);
				}
				if(index < right){
					quicksort(items, index, right);
				}
			}
			return items;
		}


		return quicksort(items, 0, items.length - 1);

	}
}

Game.onupdate = function(){
	Game.functions.Update();
}

Game.name = "treaty_logger";