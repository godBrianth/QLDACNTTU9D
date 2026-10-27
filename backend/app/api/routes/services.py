import uuid

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, func, select

from app.api.deps import RequireManager, SessionDep
from app.models import Service, ServicePublic, ServicesPublic
from app.schemas.commerce import ServiceInput

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/manage", response_model=ServicesPublic)
def read_managed_services(
    session: SessionDep,
    _: RequireManager,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> ServicesPublic:
    rows = session.exec(
        select(Service).order_by(col(Service.name)).offset(skip).limit(limit)
    ).all()
    return ServicesPublic(
        data=[ServicePublic.model_validate(s) for s in rows],
        count=session.exec(select(func.count()).select_from(Service)).one(),
    )


@router.post("", response_model=ServicePublic, status_code=201)
def create_service(
    session: SessionDep, _: RequireManager, body: ServiceInput
) -> ServicePublic:
    service = Service.model_validate(body.model_dump())
    session.add(service)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="Tên dịch vụ đã tồn tại") from None
    session.refresh(service)
    return ServicePublic.model_validate(service)


@router.put("/{service_id}", response_model=ServicePublic)
def update_service(
    session: SessionDep, _: RequireManager, service_id: uuid.UUID, body: ServiceInput
) -> ServicePublic:
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
    service.sqlmodel_update(body.model_dump())
    session.add(service)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="Tên dịch vụ đã tồn tại") from None
    session.refresh(service)
    return ServicePublic.model_validate(service)


@router.get("/{service_id}", response_model=ServicePublic)
def read_public_service(session: SessionDep, service_id: uuid.UUID) -> ServicePublic:
    service = session.get(Service, service_id)
    if not service or not service.is_active:
        raise HTTPException(
            status_code=404, detail="Không tìm thấy dịch vụ đang hoạt động"
        )
    return ServicePublic.model_validate(service)


@router.get("", response_model=ServicesPublic, summary="Lấy dịch vụ sửa chữa công khai")
def read_public_services(
    session: SessionDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
) -> ServicesPublic:
    """Trả các dịch vụ đang hoạt động để khách hàng chọn khi đặt lịch."""
    statement = select(Service).where(Service.is_active).order_by(col(Service.name))
    count_statement = select(func.count()).select_from(Service).where(Service.is_active)
    services = session.exec(statement.offset(skip).limit(limit)).all()
    return ServicesPublic(
        data=[ServicePublic.model_validate(service) for service in services],
        count=session.exec(count_statement).one(),
    )
