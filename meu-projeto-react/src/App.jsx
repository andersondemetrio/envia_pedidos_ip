import React, { useState, useCallback, useEffect } from 'react';
import { Package, User, MapPin, Truck, FileText, Settings, Plus, Trash2, Send, Home } from 'lucide-react';

// MELHORIA: Componente TabButton memorizado com React.memo
const TabButton = React.memo(({ tab, active, onClick }) => {
  const IconComponent = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <IconComponent size={16} />
      {tab.label}
    </button>
  );
});

// MELHORIA: Componente InputField memorizado com React.memo
const InputField = React.memo(({ label, value, onChange, type = 'text', required = false, options = null }) => {
  const displayValue = value === null || value === undefined ? '' : String(value);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
});

const IntelipostOrderCreator = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [orderData, setOrderData] = useState(() => {
    // Função auxiliar para obter data/hora atual no formato ISO com offset
    const getFormattedDateTime = (date = new Date()) => {
      const pad = (num) => num < 10 ? '0' + num : num;
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());

      // Obtém o offset do timezone local em minutos e converte para HH:MM
      const offsetMinutes = date.getTimezoneOffset();
      const offsetSign = offsetMinutes > 0 ? '-' : '+';
      const absOffsetMinutes = Math.abs(offsetMinutes);
      const offsetHours = pad(Math.floor(absOffsetMinutes / 60));
      const offsetRemainingMinutes = pad(absOffsetMinutes % 60);
      const timezoneOffset = `${offsetSign}${offsetHours}:${offsetRemainingMinutes}`;

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneOffset}`;
    };

    const now = getFormattedDateTime();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Um dia no futuro para estimated_delivery_date
    const tomorrowFormatted = getFormattedDateTime(tomorrow);

    return {
      // Dados básicos
      order_number: '',
      sales_order_number: '',
      delivery_method_id: '',
      customer_shipping_costs: '',
      sales_channel: '',
      scheduled: false,
      created: now, // Pre-preenchido com data/hora atual formatada
      shipped_date: now, // Pre-preenchido com data/hora atual formatada
      estimated_delivery_date: tomorrowFormatted, // Pre-preenchido com data/hora futura formatada
      shipment_order_type: 'DELIVERY',

      // Cliente final
      end_customer: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cellphone: '',
        is_company: false,
        federal_tax_payer_id: '',
        shipping_country: 'Brasil',
        shipping_state: '',
        shipping_city: '',
        shipping_address: '',
        shipping_number: '',
        shipping_quarter: '',
        shipping_additional: '',
        shipping_zip_code: '',
        shipping_reference: '',
        state_tax_payer_id: ''
      },

      // Objeto Seller (Remetente) adicionado
      seller: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cellphone: '',
        is_company: false,
        federal_tax_payer_id: '', // CNPJ do remetente
        state_tax_payer_id: '',
        country: 'Brasil',
        state: '',
        city: '',
        address: '',
        number: '',
        additional: '',
        quarter: '',
        zip_code: '',
        reference: '',
        opt_in: true, // Geralmente true por padrão para notificações
        notify: {
          whatsapp: true // Geralmente true por padrão
        }
      },

      // Origem
      origin_zip_code: '',
      origin_warehouse_code: '',
      origin_federal_tax_payer_id: '', // CNPJ da origem (pode ser o mesmo do seller se for a mesma empresa)

      // Volumes - AGORA COM IDs ÚNICOS
      shipment_order_volume_array: [{
        id: 'vol-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9), // ID único para o volume inicial
        name: '',
        shipment_order_volume_number: 1,
        weight: '0.1', // MELHORIA: Valor padrão para peso
        volume_type_code: 'BOX',
        width: '10',  // MELHORIA: Valor padrão para largura
        height: '10', // MELHORIA: Valor padrão para altura
        length: '10', // MELHORIA: Valor padrão para comprimento
        products_quantity: '1', // MELHORIA: Valor padrão para quantidade de produtos
        products_nature: 'products', // MELHORIA: Valor padrão para natureza dos produtos
        tracking_code: '',
        products: [{
          id: 'prod-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9), // ID único para o produto inicial
          weight: '0.1', // MELHORIA: Valor padrão para peso
          width: '5',  // MELHORIA: Valor padrão para largura
          height: '5', // MELHORIA: Valor padrão para altura
          length: '5', // MELHORIA: Valor padrão para comprimento
          price: '10.00', // MELHORIA: Valor padrão para preço
          description: '',
          sku: '',
          category: 'Default', // MELHORIA: Valor padrão para categoria
          quantity: 1
        }],
        shipment_order_volume_invoice: {
          invoice_series: '1', // MELHORIA: Valor padrão
          invoice_number: '1', // MELHORIA: Valor padrão
          invoice_key: '',
          invoice_date: now.split('T')[0], // MELHORIA: Apenas a data para invoice_date (algumas APIs preferem só a data)
          invoice_total_value: '10.00', // MELHORIA: Valor padrão consistente com o produto
          invoice_products_value: '10.00', // MELHORIA: Valor padrão consistente com o produto
          invoice_cfop: '5102' // MELHORIA: Valor padrão comum
        }
      }],

      // Informações adicionais
      additional_information: {},
      external_order_numbers: {
        marketplace: '',
        sales: '',
        plataforma: '',
        erp: ''
      }
    };
  });

  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Helper function para clonagem profunda (imutabilidade)
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  // MELHORIA: updateField memorizado com useCallback
  const updateField = useCallback((path, value) => {
    setOrderData(prev => {
      const newData = deepClone(prev);
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          current[key] = value;
        } else {
          if (Array.isArray(current) && !isNaN(parseInt(key))) {
            current = current[parseInt(key)];
          } else {
            if (!current[key] || typeof current[key] !== 'object') {
              current[key] = {};
            }
            current = current[key];
          }
        }
      }
      return newData;
    });
  }, []);

  // MELHORIA: updateArrayField memorizado com useCallback
  const updateArrayField = useCallback((arrayPath, index, field, value) => {
    setOrderData(prev => {
      const newData = deepClone(prev);
      let currentArray = newData;
      const pathParts = arrayPath.split('.');

      for (const part of pathParts) {
        currentArray = currentArray[part];
      }

      if (field.includes('.')) {
        const fieldParts = field.split('.');
        let target = currentArray[index];
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!target[fieldParts[i]]) target[fieldParts[i]] = {};
          target = target[fieldParts[i]];
        }
        target[fieldParts[fieldParts.length - 1]] = value;
      } else {
        currentArray[index][field] = value;
      }
      return newData;
    });
  }, []);

  // MELHORIA: addVolume memorizado com useCallback
  const addVolume = useCallback(() => {
    const newVolume = {
      id: 'vol-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
      name: '',
      shipment_order_volume_number: orderData.shipment_order_volume_array.length + 1,
      weight: '0.1',
      volume_type_code: 'BOX',
      width: '10',
      height: '10',
      length: '10',
      products_quantity: '1',
      products_nature: 'products',
      tracking_code: '',
      products: [{
        id: 'prod-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
        weight: '0.1',
        width: '5',
        height: '5',
        length: '5',
        price: '10.00',
        description: '',
        sku: '',
        category: 'Default',
        quantity: 1
      }],
      shipment_order_volume_invoice: {
        invoice_series: '1',
        invoice_number: '1',
        invoice_key: '',
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_total_value: '10.00',
        invoice_products_value: '10.00',
        invoice_cfop: '5102'
      }
    };

    setOrderData(prev => ({
      ...prev,
      shipment_order_volume_array: [...prev.shipment_order_volume_array, newVolume]
    }));
  }, [orderData.shipment_order_volume_array]);

  // MELHORIA: removeVolume memorizado com useCallback
  const removeVolume = useCallback((index) => {
    setOrderData(prev => ({
      ...prev,
      shipment_order_volume_array: prev.shipment_order_volume_array.filter((_, i) => i !== index)
    }));
  }, []);

  // MELHORIA: addProduct memorizado com useCallback
  const addProduct = useCallback((volumeIndex) => {
    const newProduct = {
      id: 'prod-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
      weight: '0.1',
      width: '5',
      height: '5',
      length: '5',
      price: '10.00',
      description: '',
      sku: '',
      category: 'Default',
      quantity: 1
    };

    setOrderData(prev => {
      const newData = deepClone(prev);
      newData.shipment_order_volume_array[volumeIndex].products.push(newProduct);
      return newData;
    });
  }, []);

  // MELHORIA: removeProduct memorizado com useCallback
  const removeProduct = useCallback((volumeIndex, productIndex) => {
    setOrderData(prev => {
      const newData = deepClone(prev);
      newData.shipment_order_volume_array[volumeIndex].products =
        newData.shipment_order_volume_array[volumeIndex].products.filter((_, i) => i !== productIndex);
      return newData;
    });
  }, []);

  // Função auxiliar para formatar datas com fuso horário
  const getFormattedDateTimeWithTimezone = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Retorna vazio se a data for inválida

    const pad = (num) => num < 10 ? '0' + num : num;
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    // Obtém o offset do timezone local em minutos e converte para HH:MM
    // Ex: -180 minutos (GMT-3) => -03:00
    const offsetMinutes = date.getTimezoneOffset();
    const offsetSign = offsetMinutes > 0 ? '-' : '+';
    const absOffsetMinutes = Math.abs(offsetMinutes);
    const offsetHours = pad(Math.floor(absOffsetMinutes / 60));
    const offsetRemainingMinutes = pad(absOffsetMinutes % 60);
    const timezoneOffset = `${offsetSign}${offsetHours}:${offsetRemainingMinutes}`;

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneOffset}`;
  }, []);

  // MELHORIA: submitOrder memorizado com useCallback
  const submitOrder = useCallback(async () => {
    if (!apiKey) {
      alert('Por favor, insira a API Key');
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      // Crie uma cópia profunda dos dados para manipulação
      const payload = deepClone(orderData);

      // Limpeza de CNPJ/CPF e CEPs
      if (payload.end_customer && payload.end_customer.federal_tax_payer_id) {
        payload.end_customer.federal_tax_payer_id = payload.end_customer.federal_tax_payer_id.replace(/[./-]/g, '');
      }
      if (payload.end_customer && payload.end_customer.shipping_zip_code) {
        payload.end_customer.shipping_zip_code = payload.end_customer.shipping_zip_code.replace(/[.-]/g, '');
      }

      if (payload.seller && payload.seller.federal_tax_payer_id) {
        payload.seller.federal_tax_payer_id = payload.seller.federal_tax_payer_id.replace(/[./-]/g, '');
      }
      if (payload.seller && payload.seller.zip_code) {
        payload.seller.zip_code = payload.seller.zip_code.replace(/[.-]/g, '');
      }

      if (payload.origin_federal_tax_payer_id) {
        payload.origin_federal_tax_payer_id = payload.origin_federal_tax_payer_id.replace(/[./-]/g, '');
      }
      if (payload.origin_zip_code) {
        payload.origin_zip_code = payload.origin_zip_code.replace(/[.-]/g, '');
      }

      // Formatação de datas para ISO 8601 completo no momento do envio
      payload.created = getFormattedDateTimeWithTimezone(payload.created);
      payload.shipped_date = getFormattedDateTimeWithTimezone(payload.shipped_date);
      payload.estimated_delivery_date = getFormattedDateTimeWithTimezone(payload.estimated_delivery_date);

      // Conversão de valores numéricos e limpeza de IDs internos do React nos volumes e produtos
      payload.customer_shipping_costs = Number(payload.customer_shipping_costs) || 0;
      payload.delivery_method_id = Number(payload.delivery_method_id) || 0;

      payload.shipment_order_volume_array = payload.shipment_order_volume_array.map(volume => {
        const processedVolume = { ...volume }; // Cópia do volume

        // **NOVIDADE: Remover o campo 'id' interno do React do volume antes de enviar**
        delete processedVolume.id;

        processedVolume.weight = Number(processedVolume.weight) || 0;
        processedVolume.width = Number(processedVolume.width) || 0;
        processedVolume.height = Number(processedVolume.height) || 0;
        processedVolume.length = Number(processedVolume.length) || 0;
        processedVolume.products_quantity = Number(processedVolume.products_quantity) || 1;
        processedVolume.shipment_order_volume_number = Number(processedVolume.shipment_order_volume_number) || 1;

        processedVolume.products = processedVolume.products.map(product => {
          const processedProduct = { ...product }; // Cópia do produto
          // **NOVIDADE: Remover o campo 'id' interno do React do produto antes de enviar**
          delete processedProduct.id;

          processedProduct.weight = Number(processedProduct.weight) || 0;
          processedProduct.width = Number(processedProduct.width) || 0;
          processedProduct.height = Number(processedProduct.height) || 0;
          processedProduct.length = Number(processedProduct.length) || 0;
          processedProduct.price = Number(processedProduct.price) || 0;
          processedProduct.quantity = Number(processedProduct.quantity) || 1;
          return processedProduct;
        });

        // Formatação da data da invoice e valores numéricos
        processedVolume.shipment_order_volume_invoice = {
          ...processedVolume.shipment_order_volume_invoice,
          invoice_total_value: Number(processedVolume.shipment_order_volume_invoice.invoice_total_value) || 0,
          invoice_products_value: Number(processedVolume.shipment_order_volume_invoice.invoice_products_value) || 0,
          invoice_date: processedVolume.shipment_order_volume_invoice.invoice_date
              ? new Date(processedVolume.shipment_order_volume_invoice.invoice_date).toISOString().split('T')[0]
              : ''
        };

        return processedVolume;
      });

      // NOVIDADE: Log do payload ANTES do envio
      console.log('Payload JSON sendo enviado:', JSON.stringify(payload, null, 2));

      const response = await fetch('https://api.intelipost.com.br/api/v1/shipment_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      // NOVIDADE: Log da resposta COMPLETA da API
      console.log('Resposta completa da API:', result);

      setResponse({ status: response.status, data: result });

    } catch (error) {
      console.error('Erro ao enviar pedido:', error); // Log de erro na console
      setResponse({ status: 'error', data: { message: error.message } });
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, orderData, getFormattedDateTimeWithTimezone]);

  const tabs = [
    { id: 'basic', label: 'Dados Básicos', icon: FileText },
    { id: 'customer', label: 'Cliente', icon: User },
    { id: 'seller', label: 'Remetente', icon: Home },
    { id: 'origin', label: 'Origem', icon: MapPin },
    { id: 'volumes', label: 'Volumes', icon: Package },
    { id: 'additional', label: 'Adicionais', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Criador de Pedidos Intelipost</h1>
          </div>

          {/* API Key */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Insira sua API Key da Intelipost"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-lg p-6">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Número do Pedido"
                  value={orderData.order_number}
                  onChange={(value) => updateField('order_number', value)}
                  required
                />
                <InputField
                  label="Número do Pedido de Venda"
                  value={orderData.sales_order_number}
                  onChange={(value) => updateField('sales_order_number', value)}
                />
                <InputField
                  label="ID do Método de Entrega"
                  value={orderData.delivery_method_id}
                  onChange={(value) => updateField('delivery_method_id', value)}
                  type="number"
                  required
                />
                <InputField
                  label="Custo do Frete (Cliente)"
                  value={orderData.customer_shipping_costs}
                  onChange={(value) => updateField('customer_shipping_costs', value)}
                  type="number"
                  step="0.01"
                  required
                />
                <InputField
                  label="Canal de Vendas"
                  value={orderData.sales_channel}
                  onChange={(value) => updateField('sales_channel', value)}
                />
                <InputField
                  label="Tipo do Pedido"
                  value={orderData.shipment_order_type}
                  onChange={(value) => updateField('shipment_order_type', value)}
                  options={[
                    { value: 'DELIVERY', label: 'Entrega' },
                    { value: 'RETURN', label: 'Devolução' },
                    { value: 'RESEND', label: 'Reenvio' }
                  ]}
                />
                <InputField
                  label="Data de Criação"
                  value={orderData.created}
                  onChange={(value) => updateField('created', value)}
                  type="datetime-local"
                />
                <InputField
                  label="Data de Despacho"
                  value={orderData.shipped_date}
                  onChange={(value) => updateField('shipped_date', value)}
                  type="datetime-local"
                />
                <InputField
                  label="Data Estimada de Entrega"
                  value={orderData.estimated_delivery_date}
                  onChange={(value) => updateField('estimated_delivery_date', value)}
                  type="datetime-local"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={orderData.scheduled}
                    onChange={(e) => updateField('scheduled', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Entrega Agendada</label>
                </div>
              </div>
            )}

            {activeTab === 'customer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Nome"
                  value={orderData.end_customer.first_name}
                  onChange={(value) => updateField('end_customer.first_name', value)}
                  required
                />
                <InputField
                  label="Sobrenome"
                  value={orderData.end_customer.last_name}
                  onChange={(value) => updateField('end_customer.last_name', value)}
                />
                <InputField
                  label="Email"
                  value={orderData.end_customer.email}
                  onChange={(value) => updateField('end_customer.email', value)}
                  type="email"
                />
                <InputField
                  label="Telefone"
                  value={orderData.end_customer.phone}
                  onChange={(value) => updateField('end_customer.phone', value)}
                />
                <InputField
                  label="Celular"
                  value={orderData.end_customer.cellphone}
                  onChange={(value) => updateField('end_customer.cellphone', value)}
                />
                <InputField
                  label="CPF/CNPJ"
                  value={orderData.end_customer.federal_tax_payer_id}
                  onChange={(value) => updateField('end_customer.federal_tax_payer_id', value)}
                />
                <InputField
                  label="Estado"
                  value={orderData.end_customer.shipping_state}
                  onChange={(value) => updateField('end_customer.shipping_state', value)}
                />
                <InputField
                  label="Cidade"
                  value={orderData.end_customer.shipping_city}
                  onChange={(value) => updateField('end_customer.shipping_city', value)}
                  required
                />
                <InputField
                  label="Endereço"
                  value={orderData.end_customer.shipping_address}
                  onChange={(value) => updateField('end_customer.shipping_address', value)}
                  required
                />
                <InputField
                  label="Número"
                  value={orderData.end_customer.shipping_number}
                  onChange={(value) => updateField('end_customer.shipping_number', value)}
                  required
                />
                <InputField
                  label="Bairro"
                  value={orderData.end_customer.shipping_quarter}
                  onChange={(value) => updateField('end_customer.shipping_quarter', value)}
                />
                <InputField
                  label="CEP"
                  value={orderData.end_customer.shipping_zip_code}
                  onChange={(value) => updateField('end_customer.shipping_zip_code', value)}
                  required
                />
                <InputField
                  label="Complemento"
                  value={orderData.end_customer.shipping_additional}
                  onChange={(value) => updateField('end_customer.shipping_additional', value)}
                />
                <InputField
                  label="Referência"
                  value={orderData.end_customer.shipping_reference}
                  onChange={(value) => updateField('end_customer.shipping_reference', value)}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={orderData.end_customer.is_company}
                    onChange={(e) => updateField('end_customer.is_company', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">É Pessoa Jurídica</label>
                </div>
              </div>
            )}

            {/* NOVIDADE: Aba para os dados do Remetente (Seller) */}
            {activeTab === 'seller' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 className="col-span-full text-lg font-semibold text-gray-800 mb-2">Dados do Remetente</h2>
                <InputField
                  label="Nome do Remetente"
                  value={orderData.seller.first_name}
                  onChange={(value) => updateField('seller.first_name', value)}
                  required
                />
                <InputField
                  label="Sobrenome do Remetente"
                  value={orderData.seller.last_name}
                  onChange={(value) => updateField('seller.last_name', value)}
                />
                <InputField
                  label="Email do Remetente"
                  value={orderData.seller.email}
                  onChange={(value) => updateField('seller.email', value)}
                  type="email"
                  required
                />
                <InputField
                  label="Telefone do Remetente"
                  value={orderData.seller.phone}
                  onChange={(value) => updateField('seller.phone', value)}
                  required
                />
                <InputField
                  label="Celular do Remetente"
                  value={orderData.seller.cellphone}
                  onChange={(value) => updateField('seller.cellphone', value)}
                />
                <InputField
                  label="CPF/CNPJ do Remetente"
                  value={orderData.seller.federal_tax_payer_id}
                  onChange={(value) => updateField('seller.federal_tax_payer_id', value)}
                  required
                />
                <InputField
                  label="Inscrição Estadual"
                  value={orderData.seller.state_tax_payer_id}
                  onChange={(value) => updateField('seller.state_tax_payer_id', value)}
                />
                <InputField
                  label="País do Remetente"
                  value={orderData.seller.country}
                  onChange={(value) => updateField('seller.country', value)}
                  required
                />
                <InputField
                  label="Estado do Remetente"
                  value={orderData.seller.state}
                  onChange={(value) => updateField('seller.state', value)}
                  required
                />
                <InputField
                  label="Cidade do Remetente"
                  value={orderData.seller.city}
                  onChange={(value) => updateField('seller.city', value)}
                  required
                />
                <InputField
                  label="Endereço do Remetente"
                  value={orderData.seller.address}
                  onChange={(value) => updateField('seller.address', value)}
                  required
                />
                <InputField
                  label="Número do Remetente"
                  value={orderData.seller.number}
                  onChange={(value) => updateField('seller.number', value)}
                  required
                />
                <InputField
                  label="Bairro do Remetente"
                  value={orderData.seller.quarter}
                  onChange={(value) => updateField('seller.quarter', value)}
                />
                <InputField
                  label="Complemento do Remetente"
                  value={orderData.seller.additional}
                  onChange={(value) => updateField('seller.additional', value)}
                />
                <InputField
                  label="CEP do Remetente"
                  value={orderData.seller.zip_code}
                  onChange={(value) => updateField('seller.zip_code', value)}
                  required
                />
                <InputField
                  label="Referência do Remetente"
                  value={orderData.seller.reference}
                  onChange={(value) => updateField('seller.reference', value)}
                />
                <div className="flex items-center gap-2 col-span-full">
                  <input
                    type="checkbox"
                    checked={orderData.seller.is_company}
                    onChange={(e) => updateField('seller.is_company', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Remetente é Pessoa Jurídica</label>
                </div>
                <div className="flex items-center gap-2 col-span-full">
                  <input
                    type="checkbox"
                    checked={orderData.seller.opt_in}
                    onChange={(e) => updateField('seller.opt_in', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Opt-in Notificações</label>
                </div>
                <div className="flex items-center gap-2 col-span-full">
                  <input
                    type="checkbox"
                    checked={orderData.seller.notify.whatsapp}
                    onChange={(e) => updateField('seller.notify.whatsapp', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Notificar por WhatsApp</label>
                </div>
              </div>
            )}

            {activeTab === 'origin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="CEP de Origem"
                  value={orderData.origin_zip_code}
                  onChange={(value) => updateField('origin_zip_code', value)}
                  required
                />
                <InputField
                  label="Código do Depósito"
                  value={orderData.origin_warehouse_code}
                  onChange={(value) => updateField('origin_warehouse_code', value)}
                  required
                />
                <InputField
                  label="CNPJ de Origem"
                  value={orderData.origin_federal_tax_payer_id}
                  onChange={(value) => updateField('origin_federal_tax_payer_id', value)}
                  required
                />
              </div>
            )}

            {activeTab === 'volumes' && (
              <div className="space-y-6">
                {/* NOVIDADE: key agora usa volume.id para estabilidade */}
                {orderData.shipment_order_volume_array.map((volume, volumeIndex) => (
                  <div key={volume.id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Volume {volumeIndex + 1}</h3>
                      {orderData.shipment_order_volume_array.length > 1 && (
                        <button
                          onClick={() => removeVolume(volumeIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <InputField
                        label="Nome do Volume"
                        value={volume.name}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'name', value)}
                      />
                      <InputField
                        label="Peso (kg)"
                        value={volume.weight}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'weight', value)}
                        type="number"
                        step="0.01"
                        required
                      />
                      <InputField
                        label="Tipo do Volume"
                        value={volume.volume_type_code}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'volume_type_code', value)}
                        options={[
                          { value: 'BOX', label: 'Caixa' },
                          { value: 'ENVELOPE', label: 'Envelope' },
                          { value: 'BAG', label: 'Saco' },
                          { value: 'TUBE', label: 'Tubo' },
                          { value: 'PALLET', label: 'Pallet' }
                        ]}
                        required
                      />
                      <InputField
                        label="Largura (cm)"
                        value={volume.width}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'width', value)}
                        type="number"
                        step="0.01"
                      />
                      <InputField
                        label="Altura (cm)"
                        value={volume.height}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'height', value)}
                        type="number"
                        step="0.01"
                      />
                      <InputField
                        label="Comprimento (cm)"
                        value={volume.length}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'length', value)}
                        type="number"
                        step="0.01"
                      />
                      <InputField
                        label="Qtde. de Produtos"
                        value={volume.products_quantity}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'products_quantity', value)}
                        type="number"
                      />
                      <InputField
                        label="Natureza dos Produtos"
                        value={volume.products_nature}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'products_nature', value)}
                        required
                      />
                      <InputField
                        label="Código de Rastreamento"
                        value={volume.tracking_code}
                        onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'tracking_code', value)}
                      />
                    </div>

                    {/* Produtos do Volume */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">Produtos</h4>
                        <button
                          onClick={() => addProduct(volumeIndex)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Plus size={16} />
                          Adicionar Produto
                        </button>
                      </div>

                      {/* NOVIDADE: key agora usa product.id para estabilidade */}
                      {volume.products.map((product, productIndex) => (
                        <div key={product.id} className="bg-gray-50 p-4 rounded-lg mb-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Produto {productIndex + 1}</span>
                            {volume.products.length > 1 && (
                              <button
                                onClick={() => removeProduct(volumeIndex, productIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <InputField
                              label="Descrição"
                              value={product.description}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'description', value)}
                              required
                            />
                            <InputField
                              label="SKU"
                              value={product.sku}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'sku', value)}
                              required
                            />
                            <InputField
                              label="Preço"
                              value={product.price}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'price', value)}
                              type="number"
                              step="0.01"
                              required
                            />
                            <InputField
                              label="Quantidade"
                              value={product.quantity}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'quantity', value)}
                              type="number"
                              required
                            />
                             <InputField
                              label="Peso (kg)"
                              value={product.weight}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'weight', value)}
                              type="number"
                              step="0.01"
                              required
                            />
                            <InputField
                              label="Largura (cm)"
                              value={product.width}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'width', value)}
                              type="number"
                              step="0.01"
                              required
                            />
                            <InputField
                              label="Altura (cm)"
                              value={product.height}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'height', value)}
                              type="number"
                              step="0.01"
                              required
                            />
                            <InputField
                              label="Comprimento (cm)"
                              value={product.length}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'length', value)}
                              type="number"
                              step="0.01"
                              required
                            />
                            <InputField
                              label="Categoria"
                              value={product.category}
                              onChange={(value) => updateArrayField(`shipment_order_volume_array.${volumeIndex}.products`, productIndex, 'category', value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Nota Fiscal */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Nota Fiscal</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <InputField
                          label="Número da NF"
                          value={volume.shipment_order_volume_invoice.invoice_number}
                          onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'shipment_order_volume_invoice.invoice_number', value)}
                          required
                        />
                        <InputField
                          label="Série da NF"
                          value={volume.shipment_order_volume_invoice.invoice_series}
                          onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'shipment_order_volume_invoice.invoice_series', value)}
                          required
                        />
                        <InputField
                          label="Chave da NF"
                          value={volume.shipment_order_volume_invoice.invoice_key}
                          onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'shipment_order_volume_invoice.invoice_key', value)}
                          required
                        />
                        <InputField
                          label="Data da NF"
                          value={volume.shipment_order_volume_invoice.invoice_date}
                          onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'shipment_order_volume_invoice.invoice_date', value)}
                          type="date"
                          required
                        />
                        <InputField
                          label="Valor Total da NF"
                          value={volume.shipment_order_volume_invoice.invoice_total_value}
                          onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'shipment_order_volume_invoice.invoice_total_value', value)}
                          type="number"
                          step="0.01"
                          required
                        />
                        <InputField
                          label="Valor Produtos NF"
                          value={volume.shipment_order_volume_invoice.invoice_products_value}
                          onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'shipment_order_volume_invoice.invoice_products_value', value)}
                          type="number"
                          step="0.01"
                          required
                        />
                        <InputField
                          label="CFOP da NF"
                          value={volume.shipment_order_volume_invoice.invoice_cfop}
                          onChange={(value) => updateArrayField('shipment_order_volume_array', volumeIndex, 'shipment_order_volume_invoice.invoice_cfop', value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addVolume}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Plus size={20} />
                  Adicionar Volume
                </button>
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Marketplace"
                  value={orderData.external_order_numbers.marketplace}
                  onChange={(value) => updateField('external_order_numbers.marketplace', value)}
                />
                <InputField
                  label="Vendas"
                  value={orderData.external_order_numbers.sales}
                  onChange={(value) => updateField('external_order_numbers.sales', value)}
                />
                <InputField
                  label="Plataforma"
                  value={orderData.external_order_numbers.plataforma}
                  onChange={(value) => updateField('external_order_numbers.plataforma', value)}
                />
                <InputField
                  label="ERP"
                  value={orderData.external_order_numbers.erp}
                  onChange={(value) => updateField('external_order_numbers.erp', value)}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={submitOrder}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Pedido
                </>
              )}
            </button>
          </div>

          {/* Response Display */}
          {response && (
            <div className="mt-6 p-4 rounded-lg bg-gray-100 border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Resposta da API:</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {JSON.stringify(response.data, null, 2)}
              </pre>
              <p className={`mt-2 font-medium ${response.status >= 200 && response.status < 300 ? 'text-green-600' : 'text-red-600'}`}>
                Status: {response.status}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelipostOrderCreator;