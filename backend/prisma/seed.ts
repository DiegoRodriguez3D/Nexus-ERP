import { PrismaClient, Role, MovementType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de datos...');

    // Limpiar datos existentes
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Crear usuarios
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: { email: 'admin@nexuserp.com', password: hashedPassword, role: Role.ADMIN },
    });
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await prisma.user.create({
        data: { email: 'almacen@nexuserp.com', password: staffPassword, role: Role.STAFF },
    });
    console.log('✅ Usuarios creados');

    // Crear proveedores
    const proveedores = await Promise.all([
        prisma.supplier.create({
            data: { name: 'TechDistributor S.L.', email: 'ventas@techdist.es', phone: '+34 912 345 678', address: 'C/ Gran Vía 45, Madrid' },
        }),
        prisma.supplier.create({
            data: { name: 'Mobiliario Oficina Express', email: 'pedidos@moboficina.com', phone: '+34 933 456 789', address: 'Av. Diagonal 250, Barcelona' },
        }),
        prisma.supplier.create({
            data: { name: 'Suministros Industriales García', email: 'info@sigarcía.es', phone: '+34 954 567 890', address: 'Pol. Ind. Aeropuerto, Sevilla' },
        }),
        prisma.supplier.create({
            data: { name: 'Electrónica Profesional', email: 'comercial@electropro.es', phone: '+34 963 678 901', address: 'C/ Colón 30, Valencia' },
        }),
    ]);
    console.log('✅ Proveedores creados:', proveedores.length);

    // Crear categorías
    const categorias = await Promise.all([
        prisma.category.create({ data: { name: 'Electrónica' } }),
        prisma.category.create({ data: { name: 'Mobiliario' } }),
        prisma.category.create({ data: { name: 'Material de Oficina' } }),
        prisma.category.create({ data: { name: 'Equipos Informáticos' } }),
        prisma.category.create({ data: { name: 'Herramientas' } }),
    ]);
    console.log('✅ Categorías creadas:', categorias.length);

    // Crear productos
    const productos = await Promise.all([
        prisma.product.create({
            data: { sku: 'ELEC-001', name: 'Monitor LED 27"', price: 299.99, stock: 45, categoryId: categorias[0].id, supplierId: proveedores[0].id },
        }),
        prisma.product.create({
            data: { sku: 'ELEC-002', name: 'Teclado Mecánico RGB', price: 89.99, stock: 78, categoryId: categorias[0].id, supplierId: proveedores[0].id },
        }),
        prisma.product.create({
            data: { sku: 'ELEC-003', name: 'Ratón Inalámbrico', price: 45.50, stock: 5, categoryId: categorias[0].id, supplierId: proveedores[3].id },
        }),
        prisma.product.create({
            data: { sku: 'MOB-001', name: 'Silla Ergonómica Premium', price: 450.00, stock: 12, categoryId: categorias[1].id, supplierId: proveedores[1].id },
        }),
        prisma.product.create({
            data: { sku: 'MOB-002', name: 'Escritorio Ajustable', price: 599.99, stock: 8, categoryId: categorias[1].id, supplierId: proveedores[1].id },
        }),
        prisma.product.create({
            data: { sku: 'MOB-003', name: 'Estantería Metálica 5 Niveles', price: 175.00, stock: 3, categoryId: categorias[1].id, supplierId: proveedores[2].id },
        }),
        prisma.product.create({
            data: { sku: 'OFI-001', name: 'Paquete Papel A4 (500 hojas)', price: 8.99, stock: 150, categoryId: categorias[2].id, supplierId: proveedores[2].id },
        }),
        prisma.product.create({
            data: { sku: 'OFI-002', name: 'Archivadores Cartón (Pack 10)', price: 24.99, stock: 2, categoryId: categorias[2].id, supplierId: proveedores[2].id },
        }),
        prisma.product.create({
            data: { sku: 'INF-001', name: 'Portátil Empresarial 15.6"', price: 899.00, stock: 25, categoryId: categorias[3].id, supplierId: proveedores[0].id },
        }),
        prisma.product.create({
            data: { sku: 'INF-002', name: 'Servidor Torre 32GB RAM', price: 2499.99, stock: 4, categoryId: categorias[3].id, supplierId: proveedores[0].id },
        }),
        prisma.product.create({
            data: { sku: 'INF-003', name: 'Disco Duro SSD 1TB', price: 129.99, stock: 67, categoryId: categorias[3].id, supplierId: proveedores[3].id },
        }),
        prisma.product.create({
            data: { sku: 'HERR-001', name: 'Kit Destornilladores Precisión', price: 35.00, stock: 42, categoryId: categorias[4].id, supplierId: proveedores[2].id },
        }),
        prisma.product.create({
            data: { sku: 'HERR-002', name: 'Multímetro Digital', price: 65.99, stock: 7, categoryId: categorias[4].id, supplierId: proveedores[3].id },
        }),
    ]);
    console.log('✅ Productos creados:', productos.length);

    // Crear movimientos de stock
    const notas = [
        'Pedido regular mensual',
        'Reposición urgente',
        'Devolución de cliente',
        'Ajuste de inventario',
        'Pedido especial',
        'Venta directa',
    ];

    const ahora = new Date();
    const movimientos = [];

    for (let i = 5; i >= 0; i--) {
        const fecha = new Date(ahora);
        fecha.setMonth(fecha.getMonth() - i);

        for (let j = 0; j < Math.floor(Math.random() * 5) + 3; j++) {
            const producto = productos[Math.floor(Math.random() * productos.length)];
            const tipo = Math.random() > 0.3 ? MovementType.IN : MovementType.OUT;
            const cantidad = Math.floor(Math.random() * 20) + 5;

            movimientos.push(
                prisma.stockMovement.create({
                    data: {
                        productId: producto.id,
                        userId: Math.random() > 0.5 ? admin.id : staff.id,
                        type: tipo,
                        quantity: cantidad,
                        notes: notas[Math.floor(Math.random() * notas.length)],
                        createdAt: new Date(fecha.getTime() + Math.random() * 28 * 24 * 60 * 60 * 1000),
                    },
                })
            );
        }
    }

    await Promise.all(movimientos);
    console.log('✅ Movimientos de stock creados:', movimientos.length);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('   Admin: admin@nexuserp.com / admin123');
    console.log('   Staff: almacen@nexuserp.com / staff123');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
