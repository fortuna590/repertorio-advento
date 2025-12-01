import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    salesByProduct: [] as any[],
    recentOrders: [] as any[],
  });

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalSales: 15,
        totalRevenue: 748.5,
        totalOrders: 15,
        averageOrderValue: 49.9,
        salesByProduct: [
          { name: "Guia Completo", value: 8 },
          { name: "Curso de Ministério", value: 4 },
          { name: "Pack de Partituras", value: 3 },
        ],
        recentOrders: [
          { id: "1", customer: "João Silva", product: "Guia Completo", amount: 49.9, date: "2024-12-01" },
          { id: "2", customer: "Maria Santos", product: "Curso de Ministério", amount: 99.9, date: "2024-11-30" },
          { id: "3", customer: "Pedro Costa", product: "Pack de Partituras", amount: 79.9, date: "2024-11-29" },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const COLORS = ["#7c3aed", "#a855f7", "#ec4899"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard de Vendas</h1>
          <p className="text-purple-200">Acompanhe o desempenho das suas vendas</p>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-slate-800 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Total de Vendas</p>
                <p className="text-3xl font-bold text-white">{stats.totalSales}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-white">R$ {stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Ticket Médio</p>
                <p className="text-3xl font-bold text-white">R$ {stats.averageOrderValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-pink-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Pedidos</p>
                <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-400" />
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Vendas por Produto */}
          <Card className="p-6 bg-slate-800 border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-6">Vendas por Produto</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.salesByProduct}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.salesByProduct.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Barras */}
          <Card className="p-6 bg-slate-800 border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-6">Vendas por Produto (Barras)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.salesByProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="value" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Pedidos Recentes */}
        <Card className="p-6 bg-slate-800 border-purple-500/20">
          <h2 className="text-xl font-semibold text-white mb-6">Pedidos Recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-3 px-4 text-purple-200 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-4 text-purple-200 font-semibold">Produto</th>
                  <th className="text-left py-3 px-4 text-purple-200 font-semibold">Valor</th>
                  <th className="text-left py-3 px-4 text-purple-200 font-semibold">Data</th>
                  <th className="text-left py-3 px-4 text-purple-200 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                    <td className="py-3 px-4 text-white">{order.customer}</td>
                    <td className="py-3 px-4 text-purple-200">{order.product}</td>
                    <td className="py-3 px-4 text-white font-semibold">R$ {order.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-purple-200">{order.date}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        Pago
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="text-purple-200 border-purple-500/30"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
