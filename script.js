$(document).ready(function() {
    // Xử lý chế độ tối/sáng
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    $('#theme-toggle-btn').on('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Thay đổi icon
      if (newTheme === 'dark') {
        $(this).find('i').removeClass('fa-moon').addClass('fa-sun');
      } else {
        $(this).find('i').removeClass('fa-sun').addClass('fa-moon');
      }
    });
    
    // Xử lý nút chọn ảnh
    $("#chooseFileBtn").click(function() {
      $("#fileInput").click();
    });
    
    // Xử lý khi chọn file
    $("#fileInput").change(function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // Cập nhật số lượng file
        $(".upload-counter").text("1 / 1");
        
        // Hiển thị xem trước
        const reader = new FileReader();
        reader.onload = function(e) {
          $("#imagePreview").html(`<img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`);
          $("#previewArea").show();
        };
        reader.readAsDataURL(file);
        
        // Ẩn khu vực nhập URL nếu đang hiển thị
        $("#urlInputArea").hide();
      }
    });
    
    // Xử lý nút thêm URL
    $("#addUrlBtn").click(function() {
      $("#urlInputArea").toggle();
      
      // Nếu đang hiển thị khu vực URL, ẩn khu vực xem trước
      if ($("#urlInputArea").is(":visible")) {
        // Xóa file đã chọn
        $("#fileInput").val("");
        $(".upload-counter").text("0 / 1");
        $("#previewArea").hide();
      }
    });
    
    // Xử lý nút làm mới
    $("#resetBtn").click(function() {
      // Reset file input
      $("#fileInput").val("");
      $(".upload-counter").text("0 / 1");
      
      // Ẩn và xóa các khu vực
      $("#urlInputArea").hide();
      $("#urlInput").val("");
      $("#previewArea").hide();
      $("#resultArea").hide();
      
      // Hiển thị thông báo
      showToast("Đã làm mới", "info");
    });
    
    // Xử lý nút xóa URL
    $("#clearUrlBtn").click(function() {
      $("#urlInput").val("");
    });
    
    // Xử lý nút tải lên
    $("#uploadBtn").click(function() {
      // Kiểm tra xem có file được chọn không
      if ($("#fileInput")[0].files.length > 0) {
        const file = $("#fileInput")[0].files[0];
        uploadToImgur(file);
      } 
      // Kiểm tra xem có URL không
      else if ($("#urlInput").val().trim() !== "") {
        const imageUrl = $("#urlInput").val().trim();
        uploadUrlToImgur(imageUrl);
      } 
      // Không có file hoặc URL
      else {
        showToast("Vui lòng chọn ảnh hoặc nhập URL ảnh trước", "error");
      }
    });
    
    // Xử lý nút sao chép link
    $("#copyLinkBtn").click(function() {
      const linkInput = document.getElementById("resultLink");
      linkInput.select();
      document.execCommand("copy");
      showToast("Đã sao chép link vào clipboard", "success");
    });
    
    // Hàm upload file lên Imgur
    function uploadToImgur(file) {
      // Tạo FormData
      const formData = new FormData();
      formData.append("image", file);
      
      // Hiển thị loading
      $("#imagePreview").html('<div style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin" style="font-size: 30px; color: #5D5FEF;"></i></div>');
      showToast("Đang tải ảnh lên...", "info");
      
      // Gửi request
      $.ajax({
        url: "https://api.imgur.com/3/image",
        type: "POST",
        headers: {
          "Authorization": "Client-ID 74f5c858f447bb9"
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
          // Hiển thị kết quả
          $("#resultLink").val(response.data.link);
          $("#resultArea").show();
          
          // Hiển thị thông báo thành công
          showToast("Tải ảnh lên thành công!", "success");
        },
        error: function(xhr) {
          console.error("Upload error:", xhr.responseText);
          showToast("Có lỗi xảy ra khi tải ảnh lên", "error");
        }
      });
    }
    
    // Hàm upload URL lên Imgur
    function uploadUrlToImgur(url) {
      // Hiển thị loading
      $("#imagePreview").html('<div style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin" style="font-size: 30px; color: #5D5FEF;"></i></div>');
      $("#previewArea").show();
      showToast("Đang tải ảnh lên...", "info");
      
      // Gửi request
      $.ajax({
        url: "https://api.imgur.com/3/image",
        type: "POST",
        headers: {
          "Authorization": "Client-ID 74f5c858f447bb9"
        },
        data: {
          image: url,
          type: "url"
        },
        success: function(response) {
          // Hiển thị kết quả
          $("#resultLink").val(response.data.link);
          $("#resultArea").show();
          
          // Hiển thị ảnh đã upload
          $("#imagePreview").html(`<img src="${response.data.link}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`);
          
          // Hiển thị thông báo thành công
          showToast("Tải ảnh lên thành công!", "success");
        },
        error: function(xhr) {
          console.error("Upload error:", xhr.responseText);
          showToast("Có lỗi xảy ra khi tải ảnh lên", "error");
          
          // Ẩn khu vực xem trước nếu có lỗi
          $("#previewArea").hide();
        }
      });
    }
    
    // Hàm hiển thị thông báo
    function showToast(message, type) {
      // Xóa toast cũ nếu có
      $(".toast-notification").remove();
      
      // Tạo toast mới
      const toast = $('<div class="toast-notification"></div>');
      
      // Thiết lập nội dung và kiểu thông báo
      if (type === "success") {
        toast.html('<i class="fas fa-check-circle"></i> ' + message);
        toast.css("background-color", "#10b981");
      } else if (type === "error") {
        toast.html('<i class="fas fa-exclamation-circle"></i> ' + message);
        toast.css("background-color", "#ef4444");
      } else {
        toast.html('<i class="fas fa-info-circle"></i> ' + message);
        toast.css("background-color", "#3b82f6");
      }

      
      
      // Thêm toast vào body
      $("body").append(toast);
      
      // Hiệu ứng hiển thị
      setTimeout(function() {
        toast.addClass("toast-show");
        
        // Tự động ẩn sau 3 giây
        setTimeout(function() {
          toast.removeClass("toast-show");
          setTimeout(function() {
            toast.remove();
          }, 300);
        }, 3000);
      }, 100);
    }
  });
  

  function showToast(message, type) {
    // Xóa toast cũ nếu có
    $(".toast-notification").remove();
    
    // Tạo toast mới
    const toast = $('<div class="toast-notification" style="position: fixed; bottom: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; color: white; z-index: 1000; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); transform: translateX(100%); opacity: 0; transition: all 0.3s ease;"></div>');
    
    // Thiết lập nội dung và kiểu thông báo
    if (type === "success") {
      toast.html('<i class="fas fa-check-circle" style="font-size: 20px; color: #ffffff;"></i> ' + message);
      toast.css("background-color", "#10b981");
    } else if (type === "error") {
      toast.html('<i class="fas fa-exclamation-circle"></i> ' + message);
      toast.css("background-color", "#ef4444");
    } else {
      toast.html('<i class="fas fa-info-circle"></i> ' + message);
      toast.css("background-color", "#3b82f6");
    }
    
    // Thêm toast vào body
    $("body").append(toast);
    
    // Hiệu ứng hiển thị
    setTimeout(function() {
      toast.css({
        "transform": "translateX(0)",
        "opacity": "1"
      });
      
      // Tự động ẩn sau 3 giây
      setTimeout(function() {
        toast.css({
          "transform": "translateX(100%)",
          "opacity": "0"
        });
        setTimeout(function() {
          toast.remove();
        }, 300);
      }, 3000);
    }, 100);
  }
  

  // Thêm vào file script.js
$(document).ready(function() {
  // Xử lý menu mobile
  $('#mobile-menu-toggle').on('click', function() {
    $('#nav-links').toggleClass('active');
  });
  
  // Đóng menu khi click vào link
  $('.nav-links a').on('click', function() {
    $('#nav-links').removeClass('active');
  });
  
  // Đóng menu khi click ra ngoài
  $(document).on('click', function(event) {
    if (!$(event.target).closest('#mobile-menu-toggle').length && 
        !$(event.target).closest('#nav-links').length) {
      $('#nav-links').removeClass('active');
    }
  });
});
