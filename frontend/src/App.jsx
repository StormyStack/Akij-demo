import React, { useState, useEffect, useCallback } from 'react';
import ErpSidebar from './components/erp/ErpSidebar';
import ErpHeader from './components/erp/ErpHeader';
import ErpDashboard from './components/erp/ErpDashboard';
import OrdersModule from './components/erp/OrdersModule';
import SuppliersModule from './components/erp/SuppliersModule';
import CustomersModule from './components/erp/CustomersModule';
import SystemAdminModule from './components/erp/SystemAdminModule';
import ItemTable from './components/ItemTable';
import ItemModal from './components/ItemModal';
import NewOrderModal from './components/erp/NewOrderModal';
import NewCustomerModal from './components/erp/NewCustomerModal';
import NewSupplierModal from './components/erp/NewSupplierModal';
import AzureConfigModal from './components/AzureConfigModal';

export default function App() {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('AZURE_API_URL') || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // ERP Datasets
  const [dashboardData, setDashboardData] = useState(null);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters for items
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Observability & System state
  const [health, setHealth] = useState(null);
  const [isFlushing, setIsFlushing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupResult, setLastBackupResult] = useState(null);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // 1. Fetch Health
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.warn('API health check deferred:', e.message);
    }
  }, [apiUrl]);

  // 2. Fetch ERP Dashboard
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/erp/dashboard`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setDashboardData(data.data);
      }
    } catch (e) {
      console.warn('Dashboard fetch deferred:', e.message);
    }
  }, [apiUrl]);

  // 3. Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`${apiUrl}/api/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setItems(data.data || []);
      }
    } catch (e) {
      console.warn('Items fetch deferred:', e.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, searchQuery, categoryFilter]);

  // 4. Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/erp/orders`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setOrders(data.data || []);
      }
    } catch (e) {
      console.warn('Orders fetch deferred:', e.message);
    }
  }, [apiUrl]);

  // 5. Fetch Customers
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/erp/customers`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setCustomers(data.data || []);
      }
    } catch (e) {
      console.warn('Customers fetch deferred:', e.message);
    }
  }, [apiUrl]);

  // 6. Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/erp/suppliers`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSuppliers(data.data || []);
      }
    } catch (e) {
      console.warn('Suppliers fetch deferred:', e.message);
    }
  }, [apiUrl]);

  // Refresh all ERP datasets
  const refreshAll = useCallback(() => {
    fetchHealth();
    fetchDashboard();
    fetchItems();
    fetchOrders();
    fetchCustomers();
    fetchSuppliers();
  }, [fetchHealth, fetchDashboard, fetchItems, fetchOrders, fetchCustomers, fetchSuppliers]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 15000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Handle Quick Create Actions
  const handleQuickAction = (type) => {
    if (type === 'order') setIsOrderModalOpen(true);
    if (type === 'item') {
      setEditingItem(null);
      setIsItemModalOpen(true);
    }
    if (type === 'customer') setIsCustomerModalOpen(true);
    if (type === 'supplier') setIsSupplierModalOpen(true);
  };

  // Create or Update Item
  const handleSaveItem = async (formData) => {
    const isEdit = !!editingItem;
    const url = isEdit ? `${apiUrl}/api/items/${editingItem.id}` : `${apiUrl}/api/items`;
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Failed to save item');
    refreshAll();
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm(`Are you sure you want to delete SKU item #${id}?`)) return;
    await fetch(`${apiUrl}/api/items/${id}`, { method: 'DELETE' });
    refreshAll();
  };

  // Create Sales Order
  const handleSaveOrder = async (orderData) => {
    const res = await fetch(`${apiUrl}/api/erp/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create sales order');
    refreshAll();
  };

  // Update Sales Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await fetch(`${apiUrl}/api/erp/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    refreshAll();
  };

  // Create Customer
  const handleSaveCustomer = async (custData) => {
    const res = await fetch(`${apiUrl}/api/erp/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData),
    });
    if (!res.ok) throw new Error('Failed to register customer');
    refreshAll();
  };

  // Create Supplier
  const handleSaveSupplier = async (suppData) => {
    const res = await fetch(`${apiUrl}/api/erp/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(suppData),
    });
    if (!res.ok) throw new Error('Failed to register supplier');
    refreshAll();
  };

  // Flush Redis Cache
  const handleFlushCache = async () => {
    try {
      setIsFlushing(true);
      await fetch(`${apiUrl}/api/items/cache/flush`, { method: 'POST' });
      await fetchItems();
    } finally {
      setIsFlushing(false);
    }
  };

  // Trigger Azure Blob Backup
  const handleTriggerBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await fetch(`${apiUrl}/api/backup/trigger`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastBackupResult(data.data);
        await fetchHealth();
      }
    } finally {
      setIsBackingUp(false);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Operations Dashboard';
      case 'inventory': return 'Inventory & Product Master';
      case 'orders': return 'Sales Orders & Dispatch';
      case 'suppliers': return 'Procurement & Vendor Directory';
      case 'customers': return 'Client & Customer Management';
      case 'system': return 'Cloud & System Administration';
      default: return 'Enterprise Resource Planning';
    }
  };

  const lowStockCount = dashboardData?.summary?.lowStockCount || 0;
  const pendingOrdersCount = dashboardData?.summary?.pendingOrders || 0;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      {/* Enterprise Left Sidebar */}
      <ErpSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lowStockCount={lowStockCount}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <ErpHeader
          activeTabTitle={getTabTitle()}
          onQuickAction={handleQuickAction}
          lowStockCount={lowStockCount}
          health={health}
          onOpenSettings={() => setIsConfigModalOpen(true)}
        />

        {/* Dynamic Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <ErpDashboard
                dashboardData={dashboardData}
                onNavigate={setActiveTab}
                onQuickAction={handleQuickAction}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === 'inventory' && (
              <ItemTable
                items={items}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                onRefresh={fetchItems}
                onAddNew={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                onEdit={(item) => {
                  setEditingItem(item);
                  setIsItemModalOpen(true);
                }}
                onDelete={handleDeleteItem}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersModule
                orders={orders}
                customers={customers}
                loading={loading}
                onAddNewOrder={() => setIsOrderModalOpen(true)}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersModule
                suppliers={suppliers}
                onAddNewSupplier={() => setIsSupplierModalOpen(true)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersModule
                customers={customers}
                onAddNewCustomer={() => setIsCustomerModalOpen(true)}
              />
            )}

            {activeTab === 'system' && (
              <SystemAdminModule
                health={health}
                apiUrl={apiUrl}
                onFlushCache={handleFlushCache}
                isFlushing={isFlushing}
                onTriggerBackup={handleTriggerBackup}
                isBackingUp={isBackingUp}
                lastBackupResult={lastBackupResult}
                onOpenConfig={() => setIsConfigModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
      />

      <NewOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        customers={customers}
      />

      <NewCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <NewSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
      />

      <AzureConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentUrl={apiUrl}
        onSaveUrl={(url) => {
          setApiUrl(url);
          localStorage.setItem('AZURE_API_URL', url);
        }}
      />
    </div>
  );
}
