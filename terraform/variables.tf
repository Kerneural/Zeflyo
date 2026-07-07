variable "do_token" {
  description = "DigitalOcean API Personal Access Token"
  type        = string
  sensitive   = true
}

variable "ssh_key_name" {
  description = "Tên của SSH Key đã được upload lên tài khoản DigitalOcean của bạn (ví dụ: 'my-key')"
  type        = string
}

variable "droplet_name" {
  description = "Tên của Droplet"
  type        = string
  default     = "zeflyo-production"
}

variable "region" {
  description = "Khu vực đặt máy chủ (Ví dụ: 'sgp1' - Singapore, hoặc 'nyc1' - New York)"
  type        = string
  default     = "sgp1"
}

variable "droplet_size" {
  description = "Cấu hình phần cứng Droplet (Khuyên dùng tối thiểu s-1vcpu-2gb cho Zeflyo Docker)"
  type        = string
  default     = "s-1vcpu-2gb"
}
