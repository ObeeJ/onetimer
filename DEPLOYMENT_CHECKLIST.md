# 🚀 OneTime Survey Platform - Production Deployment Checklist

## ✅ PRE-DEPLOYMENT CHECKLIST

### 🔧 Environment Setup
- [ ] Copy `.env.production` and update with production values
- [ ] Generate new JWT secret (256-bit): `openssl rand -base64 32`
- [ ] Update Supabase URLs and keys for production project
- [ ] Configure production Paystack keys (live keys)
- [ ] Set up production SMTP credentials
- [ ] Configure production domain in all URLs

### 🗄️ Database Setup
- [ ] Create production Supabase project
- [ ] Run database migrations: `supabase db push`
- [ ] Verify all tables exist and have correct schema
- [ ] Set up database backups
- [ ] Configure row-level security policies

### 🔐 Security Configuration
- [ ] Generate strong passwords for all services
- [ ] Configure SSL certificates (Let's Encrypt recommended)
- [ ] Set up firewall rules (ports 80, 443, 22 only)
- [ ] Configure rate limiting in nginx
- [ ] Enable security headers
- [ ] Set up fail2ban for SSH protection

### 🌐 Domain & DNS
- [ ] Purchase and configure domain
- [ ] Set up DNS A records pointing to server IP
- [ ] Configure www redirect
- [ ] Set up CDN (optional but recommended)

## 🏗️ DEPLOYMENT STEPS

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx nodejs npm postgresql-client redis-server certbot python3-certbot-nginx

# Install Go (for backend)
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### 2. Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/onetimer
sudo chown www-data:www-data /var/www/onetimer

# Upload and extract application files
cd /var/www/onetimer
# Upload your dist/ folder contents here

# Install dependencies
npm ci --production

# Set permissions
sudo chown -R www-data:www-data /var/www/onetimer
sudo chmod +x onetimer-backend
```

### 3. Service Configuration
```bash
# Copy service files
sudo cp onetimer-frontend.service /etc/systemd/system/
sudo cp onetimer-backend.service /etc/systemd/system/

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable onetimer-frontend onetimer-backend
sudo systemctl start onetimer-frontend onetimer-backend

# Check service status
sudo systemctl status onetimer-frontend onetimer-backend
```

### 4. Nginx Configuration
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/onetimer
sudo ln -s /etc/nginx/sites-available/onetimer /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate Setup
```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## ✅ POST-DEPLOYMENT VERIFICATION

### 🏥 Health Checks
```bash
# Run health check script
./health-check.sh your-domain.com

# Manual endpoint tests
curl https://your-domain.com/api/health
curl https://your-domain.com/api/healthz
```

### 🔍 Service Monitoring
- [ ] Verify all systemd services are running
- [ ] Check nginx access and error logs
- [ ] Monitor application logs for errors
- [ ] Test user registration and login flows
- [ ] Verify database connections
- [ ] Test email sending functionality

### 🚨 Error Monitoring
- [ ] Set up log rotation
- [ ] Configure monitoring alerts
- [ ] Set up uptime monitoring
- [ ] Configure backup procedures
- [ ] Document rollback procedures

## 📊 PERFORMANCE OPTIMIZATION

### 🚀 Frontend Optimization
- [ ] Enable gzip compression in nginx
- [ ] Configure static file caching
- [ ] Set up CDN for static assets
- [ ] Optimize images and fonts
- [ ] Enable HTTP/2

### ⚡ Backend Optimization
- [ ] Configure database connection pooling
- [ ] Set up Redis for caching
- [ ] Optimize database queries
- [ ] Configure proper logging levels
- [ ] Set up health check endpoints

## 🔒 SECURITY HARDENING

### 🛡️ Server Security
- [ ] Configure firewall (ufw)
- [ ] Set up fail2ban
- [ ] Disable root SSH login
- [ ] Configure SSH key authentication
- [ ] Set up automatic security updates

### 🔐 Application Security
- [ ] Verify HTTPS redirect works
- [ ] Test security headers
- [ ] Validate CORS configuration
- [ ] Check rate limiting
- [ ] Verify input validation

## 📈 MONITORING & MAINTENANCE

### 📊 Monitoring Setup
- [ ] Set up server monitoring (htop, netdata)
- [ ] Configure application performance monitoring
- [ ] Set up database monitoring
- [ ] Configure alert notifications
- [ ] Set up log aggregation

### 🔄 Backup Strategy
- [ ] Database backups (daily)
- [ ] Application code backups
- [ ] Configuration backups
- [ ] SSL certificate backups
- [ ] Test backup restoration

## 🎉 GO-LIVE CHECKLIST

- [ ] All health checks pass
- [ ] SSL certificate valid
- [ ] All services running
- [ ] Database accessible
- [ ] Email sending works
- [ ] Payment processing works
- [ ] User flows tested
- [ ] Admin functions verified
- [ ] Monitoring active
- [ ] Backups configured

## 📞 SUPPORT CONTACTS

- **Domain/DNS**: Your domain registrar support
- **SSL**: Let's Encrypt community / Certbot docs
- **Server**: Your hosting provider support
- **Database**: Supabase support
- **Email**: Your SMTP provider support
- **Payments**: Paystack support

---

## 🚨 EMERGENCY PROCEDURES

### Rollback Plan
1. Stop services: `sudo systemctl stop onetimer-frontend onetimer-backend`
2. Restore previous version from backup
3. Restart services: `sudo systemctl start onetimer-frontend onetimer-backend`
4. Verify health checks pass

### Common Issues
- **503 errors**: Check if backend service is running
- **SSL errors**: Verify certificate validity and nginx config
- **Database errors**: Check connection strings and Supabase status
- **Email errors**: Verify SMTP credentials and settings

---

**🎯 DEPLOYMENT STATUS: READY FOR PRODUCTION**

This checklist ensures a secure, scalable, and maintainable production deployment of the OneTime Survey Platform.
