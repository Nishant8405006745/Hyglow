import os
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import timedelta, datetime
from typing import List

import models, schemas, database, auth

# Create exact schemas and associations natively
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Hyglow ERP System", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_erp_data(db: Session):
    if db.query(models.Supplier).count() == 0:
        # 1. Seed Suppliers
        suppliers = [
            models.Supplier(name="Global Electric Systems Inc.", contact_name="James T.", email="supply@global.com", address="123 Tech Park, NY", payment_terms="Net 60"),
            models.Supplier(name="Volt Cable Manufacturers", contact_name="Sarah L.", email="sales@voltcable.net", address="45 Industrial Way, TX"),
            models.Supplier(name="Lumina Commercial Lighting", contact_name="Mike P.", email="orders@lumina.io", address="789 LED Blvd, CA", payment_terms="Net 30"),
        ]
        db.add_all(suppliers)
        db.commit()
        
        # 2. Seed Admin User
        from auth import get_password_hash
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            admin = models.User(username="admin", email="admin@hyglow.com", hashed_password=get_password_hash("admin123"), role="Admin")
            db.add(admin)
            db.commit()

        # 3. Seed Products
        s1, s2, s3 = db.query(models.Supplier).all()
        products = [
            models.Product(name="750kVA Pad-Mount Transformer", sku="TRANS-750-PAD", category="Distribution", description="Heavy-duty three-phase pad-mounted transformer.", cost_price=9500.0, price=12500.0, stock_quantity=15, reorder_level=5, supplier_id=s1.id, image_url="https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&q=80&w=600"),
            models.Product(name="Copper Cable - 500ft Spool", sku="CBL-CU-500", category="Cabling", description="Bare pure copper grounding wire, 1/0 AWG.", cost_price=250.0, price=450.0, stock_quantity=100, reorder_level=20, supplier_id=s2.id, image_url="https://images.unsplash.com/photo-1558230559-63110298a000?auto=format&fit=crop&q=80&w=600"),
            models.Product(name="High-Voltage Switchgear", sku="SWG-HV-01", category="Distribution", description="Modular air-insulated medium voltage switchgear.", cost_price=5000.0, price=8200.0, stock_quantity=5, reorder_level=2, supplier_id=s1.id, image_url="https://images.unsplash.com/photo-1563220464-96424eabf7db?auto=format&fit=crop&q=80&w=600"),
            models.Product(name="LED High Bay Luminaire", sku="LUM-HB-LED", category="Lighting", description="200W commercial UFO LED High Bay light.", cost_price=80.0, price=165.0, stock_quantity=200, reorder_level=50, supplier_id=s3.id, image_url="https://images.unsplash.com/photo-1565516093414-bcaaebcc3e20?auto=format&fit=crop&q=80&w=600"),
            models.Product(name="Smart Digital Electric Meter", sku="MTR-SMR-DG", category="Metering", description="Advanced metering infrastructure.", cost_price=45.0, price=125.0, stock_quantity=2, reorder_level=100, supplier_id=s1.id, image_url="https://images.unsplash.com/photo-1627988350567-c579be4032d8?auto=format&fit=crop&q=80&w=600")
        ]
        
        for p in products:
            exists = db.query(models.Product).filter(models.Product.sku == p.sku).first()
            if not exists:
                db.add(p)
        db.commit()

        # 4. Create an Initial Log Entry (Initial Stock In)
        prods = db.query(models.Product).all()
        for p in prods:
            log = models.InventoryLog(product_id=p.id, type="STOCK IN", quantity_changed=p.stock_quantity, reference="System Initialization", user_id=admin.id)
            db.add(log)
        db.commit()

# Trigger Seed
with database.SessionLocal() as db:
    seed_erp_data(db)

# ================= AUTH / DEPENDENCIES =================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    try:
        from jose import jwt, JWTError
        import auth
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def req_manager_or_higher(current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["Admin", "Manager"]:
        raise HTTPException(status_code=403, detail="Manager or Admin role required.")
    return current_user

def req_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin access enforced.")
    return current_user

# ================= AUTH ROUTES =================
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/users", response_model=List[schemas.User])
def get_users(current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter((models.User.email == user.email) | (models.User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role if user.role else "Employee",
        mobile=user.mobile,
        profile_photo=user.profile_photo
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ================= PROFILE & REQUESTS =================
@app.post("/profile/requests")
def request_profile_edit(payload: schemas.ProfileEditRequestCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "Admin":
        # Direct assign
        for k, v in payload.requested_changes.items():
            setattr(current_user, k, v)
        db.commit()
        return {"status": "success", "message": "Admin profile updated immediately."}
    
    req = models.ProfileEditRequest(user_id=current_user.id, requested_changes=payload.requested_changes)
    db.add(req)
    db.commit()
    return {"status": "pending", "message": "Request sent to Administration for Review"}

@app.get("/profile/requests", response_model=List[schemas.ProfileEditRequest])
def get_profile_requests(current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    return db.query(models.ProfileEditRequest).all()

@app.put("/profile/requests/{req_id}/status")
def update_request_status(req_id: int, status: str = Body(...), current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    req = db.query(models.ProfileEditRequest).filter(models.ProfileEditRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if req.status != "Pending":
        raise HTTPException(status_code=400, detail="Request already processed.")

    req.status = status
    req.reviewed_by = current_user.id
    
    if status == "Approved":
        user_to_update = db.query(models.User).filter(models.User.id == req.user_id).first()
        for k, v in req.requested_changes.items():
            setattr(user_to_update, k, v)
            
    db.commit()
    return {"status": "success"}

# ================= SUPPLIERS =================
@app.get("/suppliers", response_model=List[schemas.Supplier])
def get_suppliers(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()

@app.post("/suppliers", response_model=schemas.Supplier)
def create_supplier(sup: schemas.SupplierCreate, current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    db_sup = models.Supplier(**sup.dict())
    db.add(db_sup)
    db.commit()
    db.refresh(db_sup)
    return db_sup

# ================= PRODUCTS & INVENTORY LOGS =================
@app.get("/products", response_model=List[schemas.Product])
def get_products(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.post("/products", response_model=schemas.Product)
def create_product(prod: schemas.ProductCreate, current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    db_prod = models.Product(**prod.dict())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    # Log initial inventory
    if db_prod.stock_quantity > 0:
        log = models.InventoryLog(product_id=db_prod.id, type="STOCK IN", quantity_changed=db_prod.stock_quantity, reference="System Creation", user_id=current_user.id)
        db.add(log)
        db.commit()
    return db_prod

@app.put("/products/{prod_id}", response_model=schemas.Product)
def update_product(prod_id: int, p_up: schemas.ProductCreate, current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    db_prod = db.query(models.Product).filter(models.Product.id == prod_id).first()
    if not db_prod:
         raise HTTPException(status_code=404)
    for k, v in p_up.dict().items():
        setattr(db_prod, k, v)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@app.get("/inventory/logs", response_model=List[schemas.InventoryLog])
def get_inventory_logs(current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    return db.query(models.InventoryLog).order_by(models.InventoryLog.date.desc()).all()


# ================= PURCHASE ORDERS (RESTOCKING) =================
@app.post("/po/raise", response_model=schemas.PurchaseOrder)
def raise_po(po: schemas.PurchaseOrderCreate, current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    # PO represents an order TO a supplier to restock
    db_po = models.PurchaseOrder(
        supplier_id=po.supplier_id,
        user_id=current_user.id,
        total_cost=po.total_cost,
        expected_delivery=po.expected_delivery
    )
    db.add(db_po)
    db.commit()
    db.refresh(db_po)
    
    for item in po.items:
        db_item = models.PurchaseOrderItem(po_id=db_po.id, **item.dict())
        db.add(db_item)
    db.commit()
    db.refresh(db_po)
    return db_po

@app.get("/po", response_model=List[schemas.PurchaseOrder])
def get_pos(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.created_at.desc()).all()

@app.put("/po/{po_id}/advance")
def advance_po_status(po_id: int, current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    """Advances supplier stock workflow, natively triggering deliveries."""
    po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not po or po.status == "Received":
        raise HTTPException(status_code=400, detail="Invalid PO or already completely received.")
        
    if po.status == "Pending":
        po.status = "Approved"
    elif po.status == "Approved":
        po.status = "In Transit"
    elif po.status == "In Transit":
        po.status = "Received"
        
        # When Received, formally deduct capital and inject stock
        for item in po.items:
            prod = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            prod.stock_quantity += item.quantity
            # Log inventory tracking (STOCK IN)
            db.add(models.InventoryLog(product_id=prod.id, type="STOCK IN", quantity_changed=item.quantity, reference=f"PO-{po.id}", user_id=current_user.id))
            
        # Generate Accounting Bill for the PO
        db.add(models.AccountingData(type="bill", amount=po.total_cost, description=f"Payment owed to Supplier #{po.supplier_id} for PO-{po.id}", created_by=current_user.id))
    
    db.commit()
    return {"status": po.status}


# ================= SALES ORDERS (E-COMMERCE FULFILLMENT) =================
@app.post("/sales/raise", response_model=schemas.SalesOrder)
def raise_sales_order(so: schemas.SalesOrderCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Customer places an order in Storefront"""
    db_so = models.SalesOrder(
        user_id=current_user.id,
        total_revenue=so.total_revenue
    )
    db.add(db_so)
    db.commit()
    db.refresh(db_so)
    
    for item in so.items:
        db_item = models.SalesOrderItem(so_id=db_so.id, **item.dict())
        db.add(db_item)
    db.commit()
    db.refresh(db_so)
    return db_so

@app.get("/sales", response_model=List[schemas.SalesOrder])
def get_sales_orders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.SalesOrder).order_by(models.SalesOrder.created_at.desc()).all()

@app.put("/sales/{so_id}/dispatch")
def dispatch_sales_order(so_id: int, current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    """Fulfills customer order, deducts stock, creates invoice"""
    so = db.query(models.SalesOrder).filter(models.SalesOrder.id == so_id).first()
    if not so or so.status == "Dispatched":
        raise HTTPException(status_code=400, detail="Invalid SO or already dispatched.")
        
    so.status = "Dispatched"
    
    for item in so.items:
        prod = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if prod.stock_quantity < item.quantity:
             raise HTTPException(status_code=400, detail=f"Insufficient inventory for {prod.name}")
        prod.stock_quantity -= item.quantity
        # Log inventory tracking (STOCK OUT)
        db.add(models.InventoryLog(product_id=prod.id, type="STOCK OUT", quantity_changed=-item.quantity, reference=f"SO-{so.id}", user_id=current_user.id))
        
    # Generate Accounting Invoice (Revenue)
    db.add(models.AccountingData(type="invoice", amount=so.total_revenue, description=f"Client Invoice generated for Sales Order SO-{so.id}", created_by=current_user.id))
    
    db.commit()
    return {"status": "Dispatched"}

# ================= DASHBOARD & REPORTS =================
@app.get("/accounting", response_model=List[schemas.AccountingData])
def get_accounting(current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    return db.query(models.AccountingData).all()

@app.get("/dashboard/metrics")
def get_dashboard_metrics(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Total Revenue (Invoices)
    total_revenue = 0.0
    total_cost = 0.0
    if current_user.role in ["Admin", "Manager"]:
        invoices = db.query(models.AccountingData).filter(models.AccountingData.type == "invoice").all()
        bills = db.query(models.AccountingData).filter(models.AccountingData.type == "bill").all()
        total_revenue = sum(inv.amount for inv in invoices)
        total_cost = sum(b.amount for b in bills)
    
    # Active Orders
    active_sales = db.query(models.SalesOrder).filter(models.SalesOrder.status == "Pending").count()
    active_pos = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.status == "Pending").count()
    
    products = db.query(models.Product).all()
    total_stock = sum(p.stock_quantity for p in products)
    
    # Low Stock Alerts (Stock <= Reorder Level)
    low_stock_count = sum(1 for p in products if p.stock_quantity <= p.reorder_level)
    
    return {
        "revenue": total_revenue,
        "costs": total_cost,
        "active_sales_orders": active_sales,
        "active_purchase_orders": active_pos,
        "total_stock": total_stock,
        "low_stock_alerts": low_stock_count
    }

# ================= SUPPORT TICKETS =================
@app.post("/support/tickets", response_model=schemas.SupportTicket)
def create_support_ticket(ticket: schemas.SupportTicketCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_ticket = models.SupportTicket(
        user_id=current_user.id,
        subject=ticket.subject,
        message=ticket.message
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.get("/support/tickets", response_model=List[schemas.SupportTicket])
def get_support_tickets(current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    return db.query(models.SupportTicket).order_by(models.SupportTicket.created_at.desc()).all()

@app.put("/support/tickets/{ticket_id}/resolve")
def resolve_support_ticket(ticket_id: int, current_user: models.User = Depends(req_manager_or_higher), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = "Resolved"
    db.commit()
    return {"status": "success"}

# ================= STATIC FILE SERVING (PROD ONLY) =================
# We serve the frontend built assets from 'static' folder
# For local dev, this folder might not exist, but in Docker it will.
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    # Mount assets (css/js/images)
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static")
    
    # Catch-all for SPA client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API calls and files to pass through
        if full_path.startswith("api/") or "." in full_path:
            raise HTTPException(status_code=404)
        return FileResponse(os.path.join(static_dir, "index.html"))

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(static_dir, "index.html"))
