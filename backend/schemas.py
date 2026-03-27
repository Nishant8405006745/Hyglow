from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import datetime

# --- USERS ---
class UserBase(BaseModel):
    username: str
    email: str
    mobile: Optional[str] = None
    profile_photo: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "Employee"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class User(UserBase):
    id: int
    role: str
    is_active: bool
    permissions: Optional[Dict[str, bool]] = {}
    class Config:
        from_attributes = True

# --- PROFILE APPROVALS ---
class ProfileEditRequestCreate(BaseModel):
    requested_changes: Dict[str, str]

class ProfileEditRequest(BaseModel):
    id: int
    user_id: int
    requested_changes: Dict[str, str]
    status: str
    reviewed_by: Optional[int] = None
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# --- SUPPLIERS ---
class SupplierBase(BaseModel):
    name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = "Net 30"

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int
    class Config:
        from_attributes = True

# --- PRODUCTS ---
class ProductBase(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = "General"
    description: Optional[str] = None
    cost_price: float = 0.0
    price: float = 0.0
    stock_quantity: int = 0
    reorder_level: int = 10
    image_url: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = {}
    supplier_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- INVENTORY LOGS ---
class InventoryLog(BaseModel):
    id: int
    product_id: int
    type: str
    quantity_changed: int
    reference: Optional[str] = None
    date: datetime.datetime
    user_id: Optional[int] = None
    class Config:
        from_attributes = True

# --- PURCHASE ORDERS (SUPPLIER RESTOCK) ---
class POItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float

class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    expected_delivery: Optional[datetime.datetime] = None
    items: List[POItemCreate]
    total_cost: float

class PurchaseOrderItem(BaseModel):
    id: int
    po_id: int
    product_id: int
    quantity: int
    unit_cost: float
    product: Optional[Product] = None
    class Config:
        from_attributes = True

class PurchaseOrder(BaseModel):
    id: int
    supplier_id: int
    user_id: int
    status: str
    total_cost: float
    created_at: datetime.datetime
    expected_delivery: Optional[datetime.datetime] = None
    items: List[PurchaseOrderItem] = []
    supplier: Optional[Supplier] = None
    class Config:
        from_attributes = True

# --- SALES ORDERS (CUSTOMER FULFILLMENT) ---
class SOItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class SalesOrderCreate(BaseModel):
    items: List[SOItemCreate]
    total_revenue: float

class SalesOrderItem(BaseModel):
    id: int
    so_id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[Product] = None
    class Config:
        from_attributes = True

class SalesOrder(BaseModel):
    id: int
    user_id: int
    status: str
    total_revenue: float
    created_at: datetime.datetime
    items: List[SalesOrderItem] = []
    class Config:
        from_attributes = True

# --- ACCOUNTING / FINANCE ---
class AccountingDataBase(BaseModel):
    type: str
    amount: float
    currency: Optional[str] = "USD"
    description: Optional[str] = None

class AccountingDataCreate(AccountingDataBase):
    pass

class AccountingData(AccountingDataBase):
    id: int
    date: datetime.datetime
    created_by: Optional[int] = None
    class Config:
        from_attributes = True

# --- AUTH ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PermissionsUpdate(BaseModel):
    permissions: Dict[str, bool]

# --- SUPPORT TICKETS ---
class SupportTicketCreate(BaseModel):
    subject: str
    message: str

class SupportTicket(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    status: str
    created_at: datetime.datetime
    user: Optional[User] = None
    class Config:
        from_attributes = True
