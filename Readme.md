# BCC-HUB : Plataforma de Hospedagem Web Autogerenciada da Computação

## Conceito do projeto
Durante o 1º Semestre de 2022, os calouros da computação tinham a sua disposição [um site de dúvidas](https://github.com/mauriciocsz/Duvidas-IP) para a disciplina de Introdução a Programação. O site era hospedado "de graça" na plataforma conhecida como Heroku. Infelizmente, para a monitoria de 2023 essa plataforma já não estava mais gratuita. Foi feita uma busca por outras opções gratuitas para hospedagem
do site, sem sucesso. Todas as opções "free" impõem algum tipo de restrição quanto ao uso, como limite de tempo, de banda larga etc. Além do site da monitoria, muitos alunos também desenvolvem seus próprios projetos web, tanto para o [HackoonSpace](https://github.com/hackoonspace), [Maritacas GameDev](https://maritacasgamedev.itch.io/) entre outras entidades do curso, ou mesmo para seu próprio portfólio. Dessa questão surgiu a ideia do bcc-hub : Criar um servidor próprio do curso para comportar as criações dos alunos, grátis, autogerenciado e centralizado, o BCC-HUB!

De forma simplória, um "servidor" nada é mais do que uma máquina executando 24 horas e publicamente acesssível na internet. Apesar de na teoria parecer simples, gerenciar e configurar um servidor físico pode ser bastante complexo, envolvendo não só configuração locais como configurações a nível de rede. Foi necesário o intermédio dos professores e técnincos de TI da [UFSCar](https://www.ufscar.br/) para tornar esse projeto possível, além das definições explicitadas nesse README. O computador que atua como servidor também foi nos emprestado. 

O projeto, portanto, tem como foco preparar e configurar todas as dependências da máquina para receber novos projetos e disponibizá-los... de graça!

O Restante desse README explicará, de forma simplificada, como essas configurações foram feitas, e sempre que possível, será mostrado as configurações do servidor real no ar. Além disso, deixei um "guia" para quem quiser montar seu próprio servidor web.
## Pré-requisitos e recursos utilizados
### Hardware
Qualquer computador de mesa no geral pode funcionar como servidor. Obviamente exitem hardwares feitos com esse propósito (e mais caros), mas no geral basta que tenha um processador descente, memória, placa de rede e possa executar sem parar. 

Especificamente para esse trabalho, foi utilizado o seguinte computador:
Microcomputador; tipo servidor, c/ processador Xeon X3430 Quad Core, RAM 8 GB, HD 1,25 TB. - Marca IBM
### Recursos de Rede
Para ser "encontrado" na internet você precisará de um IP público. Computadores em redes domésticas obtém um tipo de IP que é chamado de privado pelo roteador e que não são roteáveis na internet. Isso, poque a quantidade de endereços IPv4 estão esgotados hoje em dia. 

No caso do servidor do projeto, o IP obtido pelos computadores da universidade já é um endereço público e protegido por firewall.

Talvez seja necessário realizar um [port-forwarding](https://simplificandoredes.com/como-fazer-portforwarding/) se desejar executar em um computador de casa ou utilizar um proxy reverso como o [ngrok](https://ngrok.com/).

### Software
Uma diversidade grande de softwares são executados em conjunto para garantir o funcionamento do servidor. Abaixo, deixo um resumo de cada um deles e um breve resumo

* nginx : servidor-web, com capacidade para atuar como gatweay de aplicação e balanceador de carga. Ele é utlizado por "redirecionar" um pedido a um site específico hospedado no hub para um container docker, em que a aplicão/site está "hospedado". Ele é a ponte estre os sites e a internet. Além disso, nele foi configurado certificado SSL e o WAF para requisições inseguras "descriptografadas", ou maliciosas. Esse Readme falará mais sobre esses componentes abaixo

* sshd : servidor de SSH para acesso remoto. O SSH permite que os administradores e usuários possam acessar o hub remotamente, executar comandos e gerenciar configurações. A porta do serviço em questão, a 22, só está liberada por meio da VPN da universidade, e a autenticação é feita por meio de chaves públicas ED25519

* ufw: firewall de host, impede conexões indevidas em portas específicas. Consegue filtar IPs e até mesmo cabeçalho TCP. Foi configurado para negar acessos que não sejam por meio dos endereços privados da VPN da universidade, no caso do firewall principal falhar.

* fail2ban : ferramenta de banimento automático com base em logs de erros de aplicações. É utilizado em conjunto com o WAF para banir IPs que tenham excedido um limitar definido de requisições maliciosas "permitidas". Ele simplesmente lê o log de auditoria gerado pelo WAF e impede acesso se muitas requisições marcadas como maliciosas foram enviadas.

* daemon docker: serviço de execução de containers docker. Um container é semelhante a uma máquian virtual, emm termos que ele permite isolar processos, que são programas em execução, do resto do sistema. É mais rápdio que uma VM, uma vez que o kernel é compartilhado do "hospedeiro". A vantagem de execuar as aplicações e sites e containers é que eles são auto contidos, e já possuem os softwares que são necessários para executar as aplicações. Além disso, as dependências de um projeto não interferem com a de outro, pois são ambientes isolados, o que permite melhor escalabilidade e gerenciabilidade do ambiente.

* modsecurity: é o WAF mencionado acima, ele é um módulo criado originalmente para o apache que foi "conectado" ao nginx. Esse módulo inspeciona cada requisição HTTP procurando indícios de atividade maliciosa, e se detectado , ele impede que a requisição seuqer chegue em um dos containers. As regras de detecção foram providenciadas pela OWASP através da [coreruleset](https://owasp.org/www-project-modsecurity-core-rule-set/).

### Home-Page
Foi desenvolvida uma home-page para o projeto também, e ela se encontra nesse repositório do github. Ela é uma adaptação do template providenciado por 
  
## Passo a passo

## Instalação


## Execução


## Bugs/problemas conhecidos


## Autores
* [Rafael Barbeta](https://github.com/rafaelbarbeta)

## Demais anotações e referências

## Imagens/screenshots