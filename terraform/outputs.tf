output "droplet_ip" {
  description = "Địa chỉ IP công khai của Droplet vừa tạo"
  value       = digitalocean_droplet.zeflyo.ipv4_address
}
