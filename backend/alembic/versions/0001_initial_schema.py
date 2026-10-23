"""Initial baseline schema migration

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-17 02:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Categories
    op.create_table(
        'categories',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, index=True, nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon_name', sa.String(50), server_default='BookOpen'),
        sa.Column('display_order', sa.Integer(), server_default='0'),
    )

    # 2. Courses
    op.create_table(
        'courses',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('category_id', sa.String(50), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('title_fa', sa.String(255), nullable=False, index=True),
        sa.Column('slug', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('course_type', sa.String(20), server_default='offline', index=True),
        sa.Column('desc_fa', sa.Text(), nullable=True),
        sa.Column('author_name', sa.String(255), server_default='حجت الاسلام دکتر زنجیر زن حسینی'),
        sa.Column('level', sa.String(50), server_default='سطوح عالی و خارج'),
        sa.Column('capacity', sa.Integer(), server_default='30'),
        sa.Column('enrolled_count', sa.Integer(), server_default='0'),
        sa.Column('skyroom_url', sa.String(500), nullable=True),
        sa.Column('schedule', sa.String(255), nullable=True),
        sa.Column('cover_image', sa.String(500), nullable=True),
        sa.Column('total_duration_hours', sa.Integer(), server_default='0'),
        sa.Column('is_published', sa.Boolean(), server_default='1', index=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # 3. Lessons
    op.create_table(
        'lessons',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('course_id', sa.String(50), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('session_number', sa.Integer(), nullable=False),
        sa.Column('title_fa', sa.String(255), nullable=False),
        sa.Column('audio_url', sa.String(500), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), server_default='0'),
        sa.Column('audio_size_mb', sa.String(20), server_default='0'),
        sa.Column('is_free_sample', sa.Boolean(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # 4. Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('mobile', sa.String(20), unique=True, index=True, nullable=False),
        sa.Column('email', sa.String(100), unique=True, index=True, nullable=True),
        sa.Column('full_name', sa.String(100), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), server_default='student', index=True),
        sa.Column('wallet_balance', sa.String(50), server_default='0 Tomans'),
        sa.Column('avatar_url', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # 5. User Sessions (Max 3 Concurrent Devices)
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('user_id', sa.String(50), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('device_name', sa.String(100), server_default='مرورگر وب'),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('user_agent', sa.String(255), nullable=True),
        sa.Column('token_jti', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_active_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
    )

    # 6. Enrollments
    op.create_table(
        'enrollments',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('user_id', sa.String(50), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('course_id', sa.String(50), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('enrolled_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.UniqueConstraint('user_id', 'course_id', name='uq_user_course_enrollment'),
    )

    # 7. User Favorites
    op.create_table(
        'user_favorites',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('user_id', sa.String(50), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('course_id', sa.String(50), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.UniqueConstraint('user_id', 'course_id', name='uq_user_course_favorite'),
    )

    # 8. Orders
    op.create_table(
        'orders',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('user_id', sa.String(50), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('tracking_number', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('status', sa.String(30), server_default='processing', index=True),
        sa.Column('total_amount', sa.Integer(), server_default='0'),
        sa.Column('items_count', sa.Integer(), server_default='1'),
        sa.Column('shipping_address', sa.Text(), nullable=True),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('recipient_name', sa.String(100), nullable=True),
        sa.Column('recipient_phone', sa.String(20), nullable=True),
        sa.Column('postal_barcode_24digit', sa.String(50), nullable=True, index=True),
        sa.Column('coupon_code', sa.String(50), nullable=True),
        sa.Column('discount_amount', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # 9. Order Items
    op.create_table(
        'order_items',
        sa.Column('id', sa.String(50), primary_key=True, index=True),
        sa.Column('order_id', sa.String(50), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('item_id', sa.String(50), nullable=False, index=True),
        sa.Column('item_type', sa.String(30), server_default='course', index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('price', sa.Integer(), server_default='0'),
        sa.Column('quantity', sa.Integer(), server_default='1'),
        sa.Column('cover_image', sa.String(500), nullable=True),
    )

    # 10. Analytics Logs
    op.create_table(
        'analytics_logs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('event_type', sa.String(50), index=True, nullable=False),
        sa.Column('resource_id', sa.String(100), nullable=True, index=True),
        sa.Column('user_id', sa.String(50), nullable=True, index=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('user_agent', sa.String(255), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True, index=True),
    )


def downgrade() -> None:
    op.drop_table('analytics_logs')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('user_favorites')
    op.drop_table('enrollments')
    op.drop_table('user_sessions')
    op.drop_table('users')
    op.drop_table('lessons')
    op.drop_table('courses')
    op.drop_table('categories')
