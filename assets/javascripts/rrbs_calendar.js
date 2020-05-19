  var long_time_format = 'HH:mm A';
  var long_date_format = 'YYYY-MM-DD';
  var long_date_format_datepicker = 'mm/dd/yy';
  var eventsJSON = [];
  var event_json_text =[];
  //var baseUrl =  "http://localhost:3000"
  
jQuery(document).ready(function($) {
	
	var getEventsJSON = function(offset, moment) {
			var url = baseUrl + '/issues.json?key=' + api_key  + '&project_id=' + project_id + '&tracker_id=' + tracker_id +'&status_id=*'
				url = url  + '&due_date=' + encodeURIComponent('>=') + moment;
				url = url + '&limit=' + 100 + '&offset=' + offset;
				
			console.log("ajax読み込み %s", url);
			
			$.ajax({
				url : url,
				dataType : 'json',
				
				
				success: function(res){ 
					console.log("ajax読み込み成功 %s", url);
					console.dir(res);
					
					buildEventsJSON(res, offset == 0);  //offset==0のときはtrue
					
					// limit 以下のときはoffset設定して再取得
					if (res.total_count > (offset + 100)) { getEventsJSON(offset + 100, moment); } 
					else { filterEvents(GetCookie_array('r_selected')); }
					 },
					
					
				error: function(){ console.log("ajax失敗 %s", url);  }
				
			});
	};
	
	var buildEventsJSON = function(eventsRawJSON, clear) {
          console.log('Building JSON');
          var count = eventsRawJSON.issues.length;
          var event = eventsRawJSON.issues;
          
          //clearにtrue送られてきたときのときは，初期化
          if (clear) {
              eventsJSON = {events:[]};
          }
          
          for (var i = 0; i < count; i++) {
              if (event[i].custom_fields == undefined) {
                  continue;   
              }
              for (var j = 0; j < event[i].custom_fields.length; j++)
              {
                  if (event[i].custom_fields[j]["id"] == fieldIdResource)
                      eventIndexResource = j;
                  if (event[i].custom_fields[j]["id"] == fieldIdStart)
                      eventIndexStart = j;
                  if (event[i].custom_fields[j]["id"] == fieldIdEnd)
					  eventIndexEnd = j;
				  if (event[i].custom_fields[j]["id"] == fieldIdText)
                      eventIndexText = j;
              }
              
              var resource_id;
                  resource_id = event[i].custom_fields[eventIndexResource].value;
              var resource;
                  for (var k = 0; k < rrbs_resources.length; k++){
                      if (rrbs_resources[k][1] == resource_id) resource = rrbs_resources[k][0];
                      }
                            
              var start;
                  start = event[i].start_date + "T" + event[i].custom_fields[eventIndexStart].value + ":00";
              var end;
                  end = event[i].due_date + "T" + event[i].custom_fields[eventIndexEnd].value + ":00";
                  
                  
              var event_color = '#1905b2';  //dark blue
              
              if (event[i].status.id == issue_status_id_book) { event_color = '#227c27' ; }  //green
              if (event[i].status.id == issue_status_id_progress) { event_color = '#ffd43a' ; }  //yellow
              if (event[i].status.id == issue_status_id_complete) { event_color = '#636363' ; }  //grey
			  
			  
			  if (event[i].status.id != issue_status_id_cancel) {   //not displayed
				eventsJSON["events"].push({
							title: event[i].subject,
							resource_id: resource_id,
							resource: resource,
							start: start,
							end: end,
							assigned_to: event[i].assigned_to.name,
							assigned_to_id: event[i].assigned_to.id,
							id: event[i].id,
							booking_text: event[i].custom_fields[eventIndexText].value,
							color: event_color,
							status_id: event[i].status.id
				});
			  }
          }
          return true;
      };
	
	

	//選択ボタンでリソースが変更された場合
	$('#rrbs_resource').change(function() {
		var r_selected = [];
		$('#rrbs_resource_checkbox:checked').each(function(){
		r_selected.push($(this).val());
		});
		document.cookie = 'r_selected=[' + r_selected + ']';
		
			filterEvents(r_selected);
	});
	
	var load_checkbox = function(){
		var r_selected = GetCookie_array("r_selected");
		
		//try {
		//		r_selected_str = r_selected_str.replace("[","")
		//		r_selected_str = r_selected_str.replace("]","")
		//	var r_selected = r_selected_str.split(',');
			
			if (r_selected.length > 0){
				$('input:checkbox[name="rrbs_resource_checkbox"]').each(function(){
					//console.log(" rrbs_resource_checkbox  "  + $(this).val());
					if (r_selected.indexOf($(this).val()) >= 0){ $(this).attr("checked",true) }
				});
				filterEvents(r_selected);
			}
		//} catch (error) { console.log("r_selected cookie undefined"); }
	};
	
	
	var filterEvents = function(r_selected){
			event_json_text = []; //初期化
			if ( eventsJSON.length != 0 ) {
				
				// eventsJSONの編集
				if (eventsJSON["events"].length > 0){
					eventsJSON["events"].forEach(function(event){
						for (var j in r_selected){
							if (event.resource_id == r_selected[j]){
								event_json_text.push(event);
								}  //選択されたr_selectedとissueのresource_idが一致するときjson配列に追加
						}
					})
				}
			}
			// console.log(event_json_text);  //デバッグ用
			console.log('r_selected: ' + r_selected + ',   event_json_text : ' + event_json_text + ',   ---render fullcalendar');  //デバッグ用
		
		
			$('#calendar').fullCalendar('removeEvents');
			$('#calendar').fullCalendar('addEventSource', event_json_text);   //再描画
			
	};
	





	$('#delete_booking').click(function() {
		if ($('#event_id').val() <= 0)
			return false;
			
		var event_id = $('#event_id').val();
		var url = baseUrl + '/issues/' + event_id + '.json?key=' + api_key;
		var action = 'DELETE';
		
		console.log("ajax通信 %s %s", action, url);
		
		$.ajax({
			url : url,
			type : action,
			datatype : 'json',
			
			success: function(res){ 
				console.log("ajax通信成功 %s %s", action, url);
				console.dir(res);
				doReload();
				},
				
			error: function(jqXHR, textStatus, errorThrown){
				if (jqXHR.status == 200){  // なぜか成功200においてもエラー処理になることがある
					console.log("ajax通信成功 %s %s", action, url);
					console.dir(jqXHR);
					doReload();
				}else{
					console.log("ajax失敗 %s %s", action, url);
					console.log(textStatus + ": " + jqXHR.responseText);
					alert(jqXHR.status + " " + jqXHR.statusText + "\n ajax失敗" + "\n textStatus : " + textStatus + "\n errorThrown : " + errorThrown + "\n responseText : " + jqXHR.responseText);
				}
			}
		});
		
		$('.rrbs_saveModal').dialog('close');
	});
      
      
      

      $('#save_booking').click(function() {
          var event_id = $('#event_id').val();
          
          var booking_date = window.moment($('#booking_date').val(), long_date_format);
          var booking_end_date = window.moment($('#booking_end_date').val(), long_date_format);
          
          var start_time = window.moment($('#start_time').val(), 'HH:mm');
          var end_time = window.moment($('#end_time').val(), 'HH:mm');
          
          var ajaxData_custom_field_values = {};
              ajaxData_custom_field_values[fieldIdStart] = start_time.format('HH:mm');
              ajaxData_custom_field_values[fieldIdEnd] = end_time.format('HH:mm');
			  ajaxData_custom_field_values[fieldIdResource] = $('#selected_resource').val();
			  ajaxData_custom_field_values[fieldIdText] = $('#booking_text').val();
              
          
          $('.rrbs_saveModal').dialog('close');
          
          //setting the variable for update or create as required
          if ($('#event_id').val() == 0) {
              var action = 'POST';
              var url = baseUrl + '/issues.json?key=' + api_key;
              
	          var ajaxData = { issue : {
	          	project_id: project_id,
	          	tracker_id: tracker_id,
	          	subject: $('#subject').val(),
	          	start_date: booking_date.format('YYYY-MM-DD'),
	          	due_date: booking_end_date.format('YYYY-MM-DD'),
	          	custom_field_values: ajaxData_custom_field_values,
	          	assigned_to_id: $('#selected_assigned_to').val(),
	          	status_id: $('#selected_issue_status').val()
	          }};
              
              
          } else {
              var action = 'PUT';
              var url = baseUrl + '/issues/' + event_id + '.json?key=' + api_key;
              
	          var ajaxData = { issue : {
	          	project: {id: project_id },
	          	tracker: {id: tracker_id },
	          	subject: $('#subject').val(),
	          	start_date: booking_date.format('YYYY-MM-DD'),
	          	due_date: booking_end_date.format('YYYY-MM-DD'),
	          	custom_field_values: ajaxData_custom_field_values,
	          	assigned_to_id: $('#selected_assigned_to').val(),
	          	status_id: $('#selected_issue_status').val()
	          }};
          }
		  console.log("ajax通信 %s %s", action, url);
          console.log(ajaxData)
          
		$.ajax({
			url : url,
			type : action,
			datatype : 'json',
			data : ajaxData,
			
			success: function(res){ 
				console.log("ajax通信成功 %s %s", action, url);
				console.dir(res);
				doReload();
				},
			
			error: function(jqXHR, textStatus, errorThrown){
				if (jqXHR.status == 200){  // なぜか成功200においてもエラー処理になることがある
					console.log("ajax通信成功 %s %s", action, url);
					console.dir(jqXHR);
					doReload();
				}else{
					console.log("ajax失敗 %s %s", action, url);
					console.log(textStatus + ": " + jqXHR.responseText);
					alert(jqXHR.status + " " + jqXHR.statusText + "\n ajax失敗" + "\n textStatus : " + textStatus + "\n errorThrown : " + errorThrown + "\n responseText : " + jqXHR.responseText);
				}
			}
		});
		
		$('#event_id').val(0);
	});
	
	

      $('.rrbs_saveModal').keypress(function(e) {
          if (e.which == 13) {
              jQuery('#save_meeting').focus().click();
              e.preventDefault();
              return false;
          }
      });
      
   
   
	// reloadメソッドによりページをリロード
	function doReload() {
	
		// 全体reload
		window.location.reload(true);

	}
	
	function GetCookie( name ){
		var result = null;
		
		var cookieName = name + '=';
		var allcookies = document.cookie;
		
		var position = allcookies.indexOf( cookieName );
		if( position != -1 )
		{
			var startIndex = position + cookieName.length;
			
			var endIndex = allcookies.indexOf( ';', startIndex );
			if( endIndex == -1 )
			{
				endIndex = allcookies.length;
			}
			
			result = decodeURIComponent(
				allcookies.substring( startIndex, endIndex ) );
		}
		
		return result;
	}
	
	function GetCookie_array( name ){
		var result = [];
		
		var cookieName = name + '=';
		var allcookies = document.cookie;
		
		var position = allcookies.indexOf( cookieName );
		if( position != -1 )
		{
			var startIndex = position + cookieName.length;
			
			var endIndex = allcookies.indexOf( ';', startIndex );
			if( endIndex == -1 )
			{
				endIndex = allcookies.length;
			}
			
			result = decodeURIComponent(
				allcookies.substring( startIndex, endIndex ) );
				
			result = result.replace("[","")
			result = result.replace("]","")
			result = result.split(',');
		}
		
		return result;
	}
	
	
	// fullcalendarの基本設定
	var loadCalendar = function() {
		$('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek'
				// オプション:  month,basicWeek,basicDay,agendaWeek,agendaDay,listWeek
			},
			defaultView: 'month',
			navLinks: true, // can click day/week names to navigate views
			editable: true,
			eventLimit: false, // allow "more" link when too many events
			businessHours: true, // display business hours
			businessHours: { 
				dow: [ 1, 2, 3, 4, 5 ], // days of week. an array of zero-based day of week integers (0=Sunday)
				start: '08:00:00',
				end: '19:00:00',
			},
			
			// 曜日表示の設定
			firstDay: 0, //週表示の始まり。0:日曜。TODO:redmine全体設定とってこれると良い
			
			
			allDaySlot: false,  // 終日スロットを表示
			axisFormat: 'H(:mm)',  // スロットの時間の書式
			//slotMinutes: 15,  // スロットの分
			//snapMinutes: 15,  // 選択する時間間隔
			timeFormat: 'H:mm',  // 時間の書式
			//scrollTime: '09:00:00',  // スクロール開始時間
			minTime: '06:00:00',  // 最小時間
			maxTime: '22:00:00',  // 最大時間
			
			
			//
			// eventにmouseoverしたときホップアップを表示(qtip利用)
			//
			eventMouseover: function (data, event, view) {
				tooltip = '<div class="tooltiptopicevent" style="width:auto;height:auto;background:#feb811;position:absolute;z-index:10001;padding:10px 10px 10px 10px ;  line-height: 200%;">'
							 + label_rrbs_subject      + ': ' + data.title + '</br>' 
							 + label_rrbs_resource     + ': ' + data.resource + '</br>'
							 + label_rrbs_assigned_to  + ': ' + data.assigned_to + '</br>' 
							 + label_rrbs_start_time   + ': ' + data.start.toISOString() + '</br>' 
							 + label_rrbs_end_time     + ': ' + data.end.toISOString() + '</br>'
							 + label_rrbs_issueid      + ': ' + data.id + '</br>'
							 + label_rrbs_booking_text + ': ' + data.booking_text + '</br>' 
							 + '</div>';
				$("body").append(tooltip);
				$(this).mouseover(function (e) {
					$(this).css('z-index', 10000);
					$('.tooltiptopicevent').fadeIn('500');
					$('.tooltiptopicevent').fadeTo('10', 1.9);
				}).mousemove(function (e) {
					$('.tooltiptopicevent').css('top', e.pageY + 10);
					$('.tooltiptopicevent').css('left', e.pageX + 20);
				});
			},
			
			//qtipの終了処置
			eventMouseout: function (data, event, view) {
				$(this).css('z-index', 8);
				$('.tooltiptopicevent').remove();
			},
			dayClick: function () {
				//tooltip.hide()
			},
			eventResizeStart: function () {
				//tooltip.hide()
			},
			eventDragStart: function () {
				//tooltip.hide()
			},
			viewDisplay: function () {
				//tooltip.hide()
			},
			
			
			// eventをクリックして編集する
              eventClick : function(calEvent, jsEvent, view){
                  $('.rrbs_saveModal').dialog({
                      title : langUpdateEvent,
                      modal : true,
                      resizable : false,
                      draggable : true,
                      width : 450,
                      show : 'blind',
                      hide : 'explode'
                  });
                  $('.rrbs_saveModal').dialog();
                  $('#selected_resource').val(calEvent.resource_id);
                  $('#booking_date').val(calEvent.start.format(long_date_format));
                  $('#booking_end_date').val(calEvent.end.format(long_date_format));
                  $('#subject').val(calEvent.title);
                  $('#event_id').val(calEvent.id);
                  $('#start_time').val(calEvent.start.format('HH:mm'));
                  $('#end_time').val(calEvent.end.format('HH:mm'));
				  $('#selected_assigned_to').val(calEvent.assigned_to_id);
				  $('#booking_text').val(calEvent.booking_text);

					$('#selected_issue_status').val(calEvent.status_id);
					
					
					//$('#delete_booking').hide();  // 台帳管理の安全性から当面隠す
					
                  $('#subject').focus();                
              },
              
			// 新規作成
			dayClick : function(date, calEvent, jsEvent, view) {
			
			
				if ("Anonymous" == $('#user_name').val() || "Anonym" == $('#user_name').val()) {
					console.log('User not logged in');
					alert("ログインしてください");
					return false;
				}
				
				
				if (!user_can_add) {
					console.log('User cannot add tickets to project');
					alert("ログインしてください");
					return false;
				}
				
				//if (!allowEdit) {
				//	console.log('Loading not finished');
				//	return false;
				//}
				
				//if (isPastDay(date)) {
				//	jAlert(langWarningCreatePast, langInfo);
				//	return false;
				//} 
					
                  
                  
                  $('#event_id').val(0);
                  $('#selected_resource').val($('#rrbs_resource_checkbox:checked').val());
                  
                  $('#booking_date').val(date.format(long_date_format));
                  $('#booking_end_date').val(date.format(long_date_format));
                  $('#subject').val("");
                  $('#start_time').val(date.format('HH:mm'));
                  $('#end_time').val(date.format('HH:mm'));
                  $('#selected_assigned_to').val($('#author_id').val());
                  
                  $('#selected_issue_status').val(1);
                  
                  $('.rrbs_saveModal').dialog({
                      title : langCreateEvent,
                      modal : true,
                      resizable : false,
                      draggable : true,
                      width : 450,
                      show : 'blind',
                      hide : 'explode'
                  });
                  $('.rrbs_saveModal').dialog('open');
                  
                  //$('#delete_booking').hide();
                  $('#subject').focus();
			},
			
			//カレンダー表示にあわせevents再読み込み
			viewRender: function(currentView){
			
				//calendarの表示している日時を取得
				//.fullCalendar('getDate')の値は，ボタン作動後の値となっている
				var moment_calendar = $('#calendar').fullCalendar('getDate');
					moment_calendar = moment_calendar.format('YYYY-MM-01');
					
				//cookieから前回の日付を取得
				var moment_cookie = GetCookie("moment");
				
				
				//高速化のためcookie日付から更新有無を判断
				if ( moment_cookie != null ) {
					if ( moment_calendar < moment_cookie ) {
						console.log("cookieよりも古い日付を表示しているため，eventsJSON再読み込み");
						getEventsJSON(0, moment_calendar);	//eventsJSONの読み込み
						
						//cookie保存
						document.cookie = 'moment=' + moment_calendar + '; max-age=300';
					}
				}else{
					//cookieないときはeventsJSONの読み込み
					getEventsJSON(0, moment_calendar);
					
					//cookie保存
					document.cookie = 'moment=' + moment_calendar + '; max-age=300';
				}
				
				$(".fc-prev-button").click(function(){
				});
				
				$(".fc-next-button").click(function(){
				});
				
				$(".fc-today-button").click(function(){
				});
			},
			
			
			
			events: eventsJSON,     // fullcalendarにeventsを設定。最初は空
		});
	};
	
	//calendar描画時は，eventsJSON再読み込み
	var d = new Date(); //今日
		moment_now = d.getFullYear() + '-' + ("0"+(d.getMonth() + 1)).slice(-2) + '-01'; //YYYY-MM-01
		getEventsJSON(0, moment_now);
		
		//cookie保存
		document.cookie = 'moment=' + moment_now + '; max-age=300';
	
	load_checkbox();
	loadCalendar();		// 描画
}); 
