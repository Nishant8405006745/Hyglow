from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Employee") # Admin, Manager, Employee
    is_active = Column(Boolean, default=True)
    mobile = Column(String, nullable=True)
    profile_photo = Column(String, nullable=True)

    profile_requests = relationship("ProfileEditRequest", back_populates="user", foreign_keys="[ProfileEditRequest.user_id]")
    permissions = Column(JSON, default={})

class ProfileEditRequest(Base):
    __tablename__ = "profile_edit_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    requested_changes = Column(JSON) 
    status = Column(String, default="Pending")
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile_requests", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    payment_terms = Column(String, default="Net 30")
    
    products = relationship("Product", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True, nullable=True)
    category = Column(String, default="General")
    description = Column(Text, nullable=True)
    
    cost_price = Column(Float, default=0.0)
    price = Column(Float, default=0.0) # Selling Price
    stock_quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    
    image_url = Column(Text, nullable=True)
    specifications = Column(JSON, default={})
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    
    supplier = relationship("Supplier", back_populates="products")
    inventory_logs = relationship("InventoryLog", back_populates="product")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    type = Column(String) # "STOCK IN", "STOCK OUT", "ADJUSTMENT"
    quantity_changed = Column(Integer) # positive or negative
    reference = Column(String, nullable=True) # e.g. "PO-102", "SO-55"
    date = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Who executed it
    
    product = relationship("Product", back_populates="inventory_logs")
    user = relationship("User")

class PurchaseOrder(Base):
    """Buying stock FROM Suppliers INTO Inventory"""
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    user_id = Column(Integer, ForeignKey("users.id")) # Employee who raised it
    status = Column(String, default="Pending") # Pending, Approved, Received, Rejected
    total_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expected_delivery = Column(DateTime, nullable=True)
    
    items = relationship("PurchaseOrderItem", back_populates="po", cascade="all, delete")
    supplier = relationship("Supplier", back_populates="purchase_orders")
    user = relationship("User", foreign_keys=[user_id])

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    unit_cost = Column(Float, default=0.0)
    
    po = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

class SalesOrder(Base):
    """Selling stock TO Customers FROM Inventory"""
    __tablename__ = "sales_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Customer/Employee placing order
    status = Column(String, default="Pending") # Pending, Dispatched, Cancelled
    total_revenue = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    items = relationship("SalesOrderItem", back_populates="so", cascade="all, delete")
    user = relationship("User", foreign_keys=[user_id])

class SalesOrderItem(Base):
    __tablename__ = "sales_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    so_id = Column(Integer, ForeignKey("sales_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    
    so = relationship("SalesOrder", back_populates="items")
    product = relationship("Product")

class AccountingData(Base):
    __tablename__ = "accounting_data"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) # invoice (sales revenue), bill (po cost), expense
    amount = Column(Float)
    currency = Column(String, default="USD")
    date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    creator = relationship("User", foreign_keys=[created_by])

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    message = Column(Text)
    status = Column(String, default="Open") # Open, Resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
