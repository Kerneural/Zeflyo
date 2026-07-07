terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

data "digitalocean_ssh_key" "existing" {
  name = var.ssh_key_name
}

resource "digitalocean_droplet" "zeflyo" {
  image              = "ubuntu-22-04-x64"
  name               = var.droplet_name
  region             = var.region
  size               = var.droplet_size
  ssh_keys           = [data.digitalocean_ssh_key.existing.id]
  backups            = false
  monitoring         = true
  ipv6               = false
  
  # Cài đặt tự động Docker và Docker Compose V2 qua Cloud-Init
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
              
              # Cấu hình repository Docker chính thức
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              
              # Cài đặt Docker Engine và Docker Compose plugin
              apt-get update
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
              
              # Kích hoạt và bật Docker khởi động cùng hệ thống
              systemctl start docker
              systemctl enable docker
              
              # Cấu hình tường lửa UFW cơ bản
              ufw allow OpenSSH
              ufw allow 80/tcp
              ufw allow 443/tcp
              ufw allow 6001/tcp
              ufw --force enable
              EOF
}
