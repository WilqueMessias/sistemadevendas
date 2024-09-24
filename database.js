import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const adicionarProduto = async (produto) => {
  try {
    const produtos = await listarProdutos();
    const produtoExistente = produtos.find(p => p.nome === produto.nome);
    if (produtoExistente) {
      throw new Error('Produto já cadastrado com esse nome.');
    }
    produto.id = produtos.length ? produtos[produtos.length - 1].id + 1 : 1;
    produtos.push(produto);
    await AsyncStorage.setItem('produtos', JSON.stringify(produtos));
  } catch (error) {
    console.error('Erro ao adicionar produto', error);
  }
};

export const listarProdutos = async () => {
  try {
    const produtosJSON = await AsyncStorage.getItem('produtos');
    return produtosJSON != null ? JSON.parse(produtosJSON) : [];
  } catch (error) {
    console.error('Erro ao listar produtos', error);
    return [];
  }
};

export const listarCategorias = async () => {
  try {
    const categoriasJSON = await AsyncStorage.getItem('categorias');
    return categoriasJSON != null ? JSON.parse(categoriasJSON) : ['Alimentos', 'Bebidas', 'Limpeza'];
  } catch (error) {
    console.error('Erro ao listar categorias', error);
    return [];
  }
};

export const removerProduto = async (nomeProduto) => {
  try {
    const produtos = await listarProdutos();
    const produtosFiltrados = produtos.filter(p => p.nome !== nomeProduto);
    await AsyncStorage.setItem('produtos', JSON.stringify(produtosFiltrados));
  } catch (error) {
    console.error('Erro ao remover produto', error);
  }
};

export const salvarVenda = async (venda) => {
  try {
    const vendas = await listarVendas();
    venda.id = vendas.length ? vendas[vendas.length - 1].id + 1 : 1;
    vendas.push(venda);
    await AsyncStorage.setItem('vendas', JSON.stringify(vendas));
  } catch (error) {
    console.error('Erro ao salvar venda', error);
  }
};

export const listarVendas = async () => {
  try {
    const vendasJSON = await AsyncStorage.getItem('vendas');
    return vendasJSON != null ? JSON.parse(vendasJSON) : [];
  } catch (error) {
    console.error('Erro ao listar vendas', error);
    return [];
  }
};

export const criarTabelaProdutosECategorias = async () => {
  try {
    const produtos = await listarProdutos();
    const categorias = await listarCategorias();

    if (produtos.length === 0) {
      console.log('Nenhum produto encontrado. AsyncStorage inicializado.');
    }
    if (categorias.length === 0) {
      await AsyncStorage.setItem('categorias', JSON.stringify(['Alimentos', 'Bebidas', 'Limpeza']));
    }
  } catch (error) {
    console.error('Erro ao inicializar AsyncStorage', error);
  }
};

export default function CadastroProduto() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarCategorias = async () => {
      const categorias = await listarCategorias();
      setCategoriasDisponiveis(categorias);
    };
    carregarCategorias();
  }, []);

  const validarCampos = () => {
    const regexPreco = /^[0-9]+(\.[0-9]{1,2})?$/;

    if (!nome || !descricao || !preco || !categoria) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return false;
    }
    if (nome.length < 3 || categoria.length < 3) {
      Alert.alert('Erro', 'Nome e categoria devem ter pelo menos 3 caracteres');
      return false;
    }
    if (!regexPreco.test(preco) || parseFloat(preco) <= 0) {
      Alert.alert('Erro', 'Preço deve ser um número válido e positivo');
      return false;
    }
    return true;
  };

  const limparCampos = () => {
    setNome('');
    setDescricao('');
    setPreco('');
    setCategoria('');
  };

  const cadastrarProduto = async () => {
    if (!validarCampos()) return;

    setLoading(true);
    try {
      await adicionarProduto({
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
      });
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      limparCampos();
      router.push('/menu-principal');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar o produto. Verifique sua conexão.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Produto</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Arroz"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição do produto"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={styles.input}
          value={preco}
          onChangeText={setPreco}
          placeholder="Ex: 19.99"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoria</Text>
        <Picker
          selectedValue={categoria}
          style={styles.picker}
          onValueChange={(itemValue) => setCategoria(itemValue)}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {categoriasDisponiveis.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={cadastrarProduto}>
          <Text style={styles.buttonText}>Cadastrar Produto</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#28a746',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    color: '#fff',
    backgroundColor: '#333',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
});
