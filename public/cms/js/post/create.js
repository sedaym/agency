var temp_images;
var croped_object;
var yt_video_index=0;
var images=[];
var croped_images_ul=$("#croped-images-list");
var image_counter=0;

//array to store images
var files=[];


$(document).ready(function(){
	var updating = $("#updating");
	
});

//Add document.ready
//
//we could just set the data-provide="tag" of the element inside HTML, but IE8 fails!
var tag_input = $('#form-field-tags');

var tags="";

$.ajax({
	url: "/cms/tag/all",
	type: "get",
	processData: false,
	contentType: false,
	success: function (res) {
		tags = JSON.parse(res.tags);

		if(! ( /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase())) ) 
		{
			tag_input.tag(
			  {
				placeholder:tag_input.attr('placeholder'),
				//enable typeahead by specifying the source array
				source: tags,//defined in ace.js >> ace.enable_search_ahead
			  }
			);
		}
		else {
			//display a textarea for old IE, because it doesn't support this plugin or another one I tried!
			tag_input.after('<textarea id="'+tag_input.attr('id')+'" name="'+tag_input.attr('name')+'" rows="3">'+tag_input.val()+'</textarea>').remove();
			//$('#form-field-tags').autosize({append: "\n"});
		}		
	}
});



function FilesUploadChange()
{
	temp_images=$("#images").prop("files");


	
	formdata = new FormData();

	for(var i=0;i<temp_images.length;i++)
	{
		formdata.append("images[]", temp_images[i]);
		images.push(temp_images[i]);

	}

	$.ajax({
		url: "/cms/tmp",
		type: "POST",
		data: formdata,
		processData: false,
		contentType: false,
		success: function (res) {
			temp_images = JSON.parse(res);
			displayCropView(temp_images);
		}
	});
}

function displayCropView(temp_images)
{
	var temp_images_lengh=temp_images.length;
	var updating= $('#updating').val();
	for(var i=0; i<temp_images_lengh;i++)
	{

		files.push(temp_images[i]);
		templateHTML=$('#image_item').html();
	    template=Handlebars.compile(templateHTML);
	    compiledHtml=template({data:temp_images[i],index:image_counter+i});
	    croped_images_ul.append(compiledHtml);

		$("#croped-img-"+(image_counter+i)).Jcrop({
			aspectRatio: 3/2,
            allowSelect: false,
            keySupport: false,
            setSelect: [0, 0, 600, 400],
            minSize: [300, 200],
            boxWidth: 800
		});
	}
	image_counter=image_counter+temp_images_lengh;
}

var croped_images_array=[];

function submitForm()
{
	formdata = new FormData();

	croped_images_array=JSON.stringify(getCropedImagesArray());
	formdata.append("croped_images_array",croped_images_array);

	for(var i=0;i<files.length;i++)
	{
		formdata.append("images[]", files[i]);
	}


	var title = $("#title").val();
	var body = $("#body").val();
	var section = $("#section").val();
	var tags=$("#form-field-tags").val();
	if($('#updating').val()=="1")
	{
		var old_tags=$(".tag-value");
		for(var i=0;i<old_tags.length;i++)
		{
			tags=tags+", "+(old_tags[i].innerText);
		}
	}

	formdata.append("title",title);
	formdata.append("body",body);
	formdata.append("section",section);
	formdata.append("tags",tags);


	videos_array=JSON.stringify(getVideosArray());
	formdata.append("videos",videos_array);

	if($('#updating').val()=="1")
	{
		post_id=$('#post_id').val();
		submitUpdatedForm(formdata,post_id);

	}else{
		submitNewForm(formdata);
	}

}


function getCropedImagesArray()
{
	jQuery('.image_to_crop').each(function() {
	  	image_to_crop = $(this);
	  	image_to_crop.Jcrop({
	    onChange: function(coords){
	    	croped_images_array.push(showPreview(image_to_crop, coords));
	    },
		});
	});

	return croped_images_array;
}



function showPreview(image_to_crop, coords) {
	
	var croped_image_object={
		"name":image_to_crop.prop("src"),
		crop_x : Math.round(coords.x),
		crop_y : Math.round(coords.y),
		crop_width  : Math.round(coords.w),
		crop_height  : Math.round(coords.h),
		width : getImageWidth(),
		height : getImageHeight(),
	};
	return croped_image_object;

}

function getImageWidth()
{
	// return $('.jcrop-holder img:eq(0)').width();
	return $(".image_to_crop").width();
}

function getImageHeight()
{
	// return $('.jcrop-holder img:eq(0)').height();
		return $(".image_to_crop").height();


}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////Youtube Videos//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addYoutubeVideo()
{
	yt_url=$("#yt_video_txt").val();
	yt_id=validYT(yt_url);
	if(yt_id!=false)
	{
		yt_data = ajax_youtube(yt_url,function(data){
			append_video(data,yt_url);
		});

		$("#yt_video_txt").val("");

	}
}

function validYT(url) 
{
	var p = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
	return (url.match(p)) ? RegExp.$1 : false;
}

function ajax_youtube(url,callback)
{
	$.ajax({
        url: "http://gdata.youtube.com/feeds/api/videos/"+get_youtube_id(url)+"?v=2&alt=json",
        dataType: "jsonp",
        success: function (data) {
  			return callback(data)
        }
    });
}

function get_youtube_id(url)
{
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11)
        return match[7];
}

function append_video(yt_data,url)
{
	console.log(yt_data);

	var title = yt_data.entry.title.$t;
	var description = yt_data.entry.media$group.media$description.$t;
	var img = yt_data.entry.media$group.media$thumbnail[0].url;

	$("#videos_list").append(yt_template(yt_video_index,img,title,description,url));
	yt_video_index = yt_video_index + 1;
	
}

function yt_template(i,img,title,description,url)
{
	return '<li class="video_item" id="video_item_'+i+'"><div class="video-container"><div class="yt-img"><img src="'+img+'" class="yt-img-thumbnail"></div><div class="yt-data"><input type="text" id="yt-title-'+i+'" class="yt-title" value="'+title+'"><textarea id="yt-desc-'+i+'" class="yt-desc">'+description+'</textarea><input type="hidden" class="yt-url" id="yt-url-'+i+'" value="'+url+'"></div><div class="yt-delete"><button type="button" class="btn btn-xs btn-info yt-delete-btn" onclick="delete_yt('+i+')"><i class="icon-trash"></i></button></div></div></li>'
}

function delete_yt(id)
{
	$("#video_item_"+id).remove();
		yt_video_index--;
}

function getVideosArray()
{
	var videos_title = $(".yt-title"),
	videos_desc = $(".yt-desc"),
	videos_thumbnail = $(".yt-img-thumbnail");
	videos_url = $(".yt-url");


	var videos_array=[];

	for (var i = 0; i < videos_title.length; i++) {
		var video_obj = {
			"title" : $(videos_title[i]).val(),
			"desc" : $(videos_desc[i]).val(),
			"src" : $(videos_thumbnail[i]).prop("src"),
			"url" : "http://youtube.com/embed/"+get_youtube_id($(videos_url).val()),

		}

		console.log("http://youtube.com/embed/"+get_youtube_id($(videos_url).val()));

		videos_array.push(video_obj);	
	};

	return videos_array;

}


function removeTag(tag)
{
	$(tag).parent().remove();
}

function getTags()
{
	tags=$("#form-field-tags").val();
	tags_values=$(".tag-value");
	old_tags="";

	for(var i=0;i<tags_values.length;i++)
	{
		old_tags=old_tags+($(tags_values[i]).html())+",";
	}
	return old_tags+tags;


}

function submitUpdatedForm(formdata,id)
{
	console.log(formdata);
	$.ajax({
		url: "/cms/post/"+id,
		type: "POST",
		data: formdata,
		processData: false,
		contentType: false,
		success: function (res) {
			top.location="/cms/content";
		}
	});
}


function submitNewForm(formdata)
{
	$.ajax({
		url: "/cms/post",
		type: "POST",
		data: formdata,
		processData: false,
		contentType: false,
		success: function (res) {

			top.location="/cms/content";
		}
	});
}


function deleteImage(id,element)
{
	//remove croped image list item
	//delete temp image from the server
	$.ajax({
		url:"/cms/tmp/delete",
		type:"POST",
		data:{image:id},
		success:function(res)
		{
			if(res.result==true)
			{
				files = jQuery.grep(files, function(value) {
				  return value != id;
				});

				$(element).parent().remove();

			}
		}
	});
}


function removePhotos(id, post_id)
{
    var obj = {id: id, post_id: post_id};
    $.ajax({
        url: "/cms/post/remove/photo",
        type: "POST",
        data: obj,
        success: function(res){
            location.reload();
        },
        error: function(xhr, status, error) {
            if(xhr.status == 400 || xhr.status == 403 || xhr.status == 408 || xhr.status == 500 || xhr.status == 504)
            {
                alert(xhr.statusText);
            }
        }
    });
}








