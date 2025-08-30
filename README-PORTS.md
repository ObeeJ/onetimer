# OneTime Survey Platform - Port Configuration

## 🚀 Multi-Port Setup

The OneTime Survey Platform uses different ports for different user types:

### **Port 3000 - Main Application**
- **Filler Dashboard** (`/filler`)
- **Creator Dashboard** (`/creator`) 
- **Landing Page** (`/`)

### **Port 3001 - Admin Panel**
- **Admin Dashboard** (`/admin`)
- **User Management**
- **Survey Moderation**
- **Payment Processing**

### **Port 3002 - Super Admin Panel**
- **Super Admin Dashboard** (`/super-admin`)
- **Admin Management**
- **System Configuration**
- **Audit Logs & Security**

## 🛠️ Development Commands

### Start Individual Services
```bash
# Main app (Filler + Creator)
npm run dev

# Admin panel
npm run dev:admin

# Super admin panel  
npm run dev:superadmin
```

### Production Commands
```bash
# Build all
npm run build

# Start main app
npm start

# Start admin panel
npm run start:admin

# Start super admin panel
npm run start:superadmin
```

## 🌐 Access URLs

- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3001/admin
- **Super Admin Panel**: http://localhost:3002/super-admin

## 🔐 Security Benefits

- **Isolated Admin Access**: Admin functions on separate port
- **Enhanced Security**: Super admin completely isolated
- **Network Segmentation**: Different ports can have different firewall rules
- **Load Balancing**: Can distribute admin load separately

## 📝 Notes

- Landing page automatically redirects authenticated users to correct port
- Admin and Super Admin authentication is handled on their respective ports
- All applications share the same codebase but run on different ports