# Andrade e Calazans Advogados Associados

Site institucional do escritório **Andrade e Calazans Advogados Associados**, desenvolvido em HTML/CSS/JS puro, pronto para publicação via **GitHub Pages**.

## 🌐 Publicar no GitHub Pages

### 1. Criar o repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **New repository**
3. Dê um nome (ex: `andrade-calazans-adv` ou `site`)
4. Deixe como **Public**
5. Clique em **Create repository**

### 2. Enviar os arquivos

#### Pelo navegador (mais simples):
1. No repositório criado, clique em **uploading an existing file**
2. Arraste o arquivo `index.html` para a área indicada
3. Clique em **Commit changes**

#### Pelo terminal:
```bash
git init
git add index.html
git commit -m "Primeiro commit — site A&C Advogados"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

### 3. Ativar o GitHub Pages

1. No repositório, vá em **Settings** → **Pages** (menu lateral)
2. Em **Source**, selecione **Deploy from a branch**
3. Escolha a branch **main** e a pasta **/ (root)**
4. Clique em **Save**

Após alguns minutos, o site estará disponível em:
```
https://SEU_USUARIO.github.io/SEU_REPOSITORIO/
```

## 📁 Estrutura do projeto

```
/
└── index.html    ← página completa (HTML + CSS + JS embutidos)
```

O site é um arquivo único autocontido — sem dependências externas além das fontes do Google Fonts, que são carregadas automaticamente pelo navegador.

## ✏️ Personalizações comuns

| O que alterar | Onde encontrar no `index.html` |
|---|---|
| Número de WhatsApp | Buscar por `wa.me/5524333263794` |
| Telefone de contato | Buscar por `(24) 3326-3794` |
| Endereço | Seção `#localizacao` → `.loc-block` |
| Horário de atendimento | Seção `#localizacao` → `.loc-block` |
| Nomes dos advogados | Seção `#equipe` → `.team-name` |
| Textos das áreas de atuação | Seção `#areas` → `.area-desc` |
| Link do Instagram | Buscar por `@aec.advogados` |
| Embed do mapa | Substituir o `src` do `<iframe>` em `#localizacao` |

## 🔗 Links úteis

- [Instagram — @aec.advogados](https://www.instagram.com/aec.advogados/)
- [WhatsApp](https://wa.me/5524333263794)
- [Documentação do GitHub Pages](https://docs.github.com/pt/pages)
