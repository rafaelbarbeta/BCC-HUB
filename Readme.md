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
Foi desenvolvida uma home-page para o projeto também, e ela se encontra nesse repositório do github. Ela é uma adaptação do template providenciado por [html design](https://html.design/)
  
## Resumo de configurações

Abaixo, dexarei um resumo de passos feitos para configurar o hub, incluido a instalação de componentes e sua execução. As etapas estão aproximadamente em ordem, mas algumas configurações foram feitas em ordem distinta do que aqui apresentado, porém, para melhor compreensão, elas foram separadas em blocos.

### Instalação do SO e configuração da BIOS

Etapa realizada no laboratório, com acesso físico ao servidor
Instalação rotineira de sistema operacional. Foi utilizado a distribuição Debian, masi precisamente a versão 11 "bullseye". Além da própria instalação, a BIOS foi configurada para que o computador religue sozinho em caso de falta de energia, garantindo a disponibilidade do servidor. 

O primeiro usuário criado foi o "monitor" na máquina com nome "bcchub"

#### Conectividade, alcançabilidade e acesso remoto

Esta parte foi feita com ajuda do professor [Fábio Luciano Verdi](https://www.dcomp.ufscar.br/verdi/) e do analista de TI da UFSCar. As etapas estão descritas abaixo. Note que algumas delas ocorreram ao longo de quase todo o projeto.

1. Atrelagem do MAC da interface ethernet do servidor a um IP fixo, distribuido pelo DHCP.

Aqui, fixamos o IP para que ele nunca mude. O computador sempre obterá o mesmo IP do DHCP

2. Atualização do firewall, permitindo tráfego de rede nas portas 80 e 443 do servidor

Apesar do IP obtido ser público (ou seja alcançavel na internet), qualquer acesso externo é barrado pelo firewall. As regras precisaram ser atualizadas para que os usuários possam acessar as páginas web.

3. Criação de "conta" na VPN da universidade, e liberação da porta 22

O acesso remoto é feito por ssh, na porta 22. Porém, essa porta só não é bloqueada pelo firewall se a conexão partir da conexão por VPN da universidade, por segurança.

4. Obtenção de nome de domínio, por cima do subdomínio dcomp

Uma entrada no DNS da universidade foi inserido para ser possível acessar o hub por nome, invés de IP, etapa essa necessária para futuramente obter um certificado SSL. O hub é acessível pelo nome [bcchub.dcomp.ufscar.br](https://bcchub.dcomp.ufscar.br). O nome foi decidido a partir de um formulário enviado a todos os estudantes ativos na graduação em Ciência da Computação.

Como mencionado, um serviço ssh foi instalado para permitir conectividade:

```bash
sudo apt install sshd
```

Em seguida, desabilitou-se o acesso por senha por segurança. Para isso, editou-se "sshd_config" e o atributo PasswordAuthentication foi setado como "no". Além disso, no "home" do usuário monitor, adicionou-se a chave publica do administrador:

```bash
echo "<chave_publica_aqui>" >> ~/.ssh/authorized_keys
```

![sem senha no ssh](/readme_images/ssh_nopassword.png)

Apartir desse ponto, todas as configurações foram feitas remotamente, dentro da VPN da universidade.

Se desejar replicar o projeto, será necessário realizar mais ou menos os mesmos passos. Cabe destacar que talvez seja necessário comprar um nome domínio e IP.

### Instalação do servidor web

Utilizou-se a versão mainline do nginx, versão 1.25. o tutorial de instalação se encontra aqui:
[nginx.org](https://nginx.org/en/linux_packages.html#Debian)

Após a instalação, foi feita a configuração da home page do hub no nginx, cujo código fonte se encontra na integra aqui nesse repositório. Para isso, é necessário definir um arquivo contendo um "server-block" na pasta */etc/nginx/sites-available* e criar um link simbólico para esse arquivo na pasta */etc/nginx/sites-enabled* . O arquivo principal, */etc/nginx/nginx.conf*, por hora, não precisa ser modificado, ele já inclui qualquer configuração de sites contidos na pasta *sites-enabled*. Abaixo, deixo um exemplo da configuração inicial para servir uma página web por HTTP.

```
server {
        listen 80 default_server;
        root /var/www/html;
        index index.html index.htm;
        server_name bcchub.dcomp.ufscar.br;

        location / {
            try_files $uri $uri/ =404;
        }

        # Outras configs...
        #...
        #...
}
```

![bcchub home page](/readme_images/bcchub.png)

Perceba que essa não é a configuração em execução no
momento, que é "apenas" por HTTPS, explicado no tópico abaixo.

É boa prática testar se a configuração está sintaticamente correta antes de recarregá-la:

```bash
sudo nginx -t
```

Depois, recarregue para que as mudanças entrem em ação:

```bash
sudo systemctl reload nginx
```

### Protegendo o servidor

O hub irá abrigar diversas aplicações de desenvolvedores distintos e essas estarão publcimanete disponíveis na internet. Não se sabe de antemão que tipo de aplicação será hospedada, ou quais dados serão guardados. Por isso, se faz necessário criar uma estrutura segura de hospedagem, que possa antender a diferentes requerimentos de segurança das aplicações, além do próprio servidor. Se tratando de segurança web, há trés problemas de segurança que merecem atenção:

1. Captura de pacotes
2. Vulnerabilida de aplicação
3. Vulnerabilidade do servidor

O item 1 faz referência a "bisbilhotagem" de pacotes entre o servidor e o cliente. Um ator de ameaça em algum ponto da comunicação pode ler os pacotes e extrair informações comprometedoras, como usuário e senha. Para evitar esse tipo de problema, se usa conexão criptografada, HTTPS. 

Para poder servir páginas HTTPS precisamos de uma chave privada e um certificado digital para o domínio bcchub.dcomp.ufscar.br. O domínio foi validado com a autoridade de certificação [ZeroSSL](https://zerossl.com/) de graça. Outra boa opção gratuita é a [Let's Encrypt](https://letsencrypt.org/pt-br/), recomendada se quiser montar seu próprio servidor.

Com a chave e certificado em mãos, adiciona-se eles na configuração do nginx. Um novo arquivo com um novo "server_block" deve ser adicionado em *sites-available*:

```
server {
        # SSL configuration
        #
        listen 443 ssl default_server;
        ssl_certificate     \<CAMINHO_PARA_O_CERTIFICADO\>;
        ssl_certificate_key \<CAMINHO_PARA_A_CHAVE\>;
        root /var/www/html;
        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;
        server_name bcchub.dcomp.ufscar.br;

        location / {
            try_files $uri $uri/ =404;
        }
}
```

Modificou-se o antigo server block http para sempre redirecionar o usuário para a versão segura do site:

```bash
server {
        listen 80 default_server;
        server_name _;

        return 301 https://bcchub.dcomp.ufscar.br;

}
```

Para mitigação do item 2, a opção escolhida foi instalar um Web Application Firewall, o modsecurity, mencionado anteriormente. Esse passo é um tanto trabalhoso, visto que é necessário compilá-lo como um módulo dinâmico para o nginx. [Esse artigo foi utilizado](https://medium.com/codelogicx/securing-nginx-server-using-modsecurity-oswaf-7ba79906d84c) como guia para realizar essa instalação. 

Adicionou-se a diretiva *load_module /etc/nginx/modules/ngx_http_modsecurity_module.so;* para carregar o módulo e ativá-lo com *modsecurity on*. Como mencionado, opera com a Core Rule Set(CRS) da OWASP, que para o projeto está instalada na pasta */usr/local/modsecurity-crs*. O repositório das regras se encontra aqui:  https://github.com/coreruleset/coreruleset.git. 

Na configuração principal do modsecurity, é possível definir se o módulo apenas fará detecção, registrando cada tentativa suspeita, ou ele efetivamente bloqueará a requsição. Esse comportamento é controlado pela diretiva *SecRuleEngine* e para esse projeto, foi definida como *On* (bloqueio ativo):

![bloqueio de shell reverso](/readme_images/block.png)

Apesar da corerulest da OWASP cobrir diversos cenários de ataque, ela não impede que uma vulnerabilidade em uma aplicação hospedada seja explorada, apesar de dificultar o trabalho do ator ameaça. Pensando nisso, complementou-se a segurança das aplicações com o software fail2ban, que é capaz de ler logs de erro de programas e tomar uma ação de banimento com base em uma série de tentativas de ataque. A ideia é que um agente ameaça provavelmente fará uma série de solicitações maliciosas mau-sucedidas (identificadas pelo WAF) para tentar encontrar alguma vulnerabilidade e/ou "bypassar" o WAF. Isso desencadeará uma respota do fail2ban que bloqueará qualquer outra requisição desse IP por um longo período de tempo, repelindo a ameaça por hora. Isso também é efetivo contra scanners de vulnerabilidade percorrendo toda a internet e procurando algum alvo vulnerável.

A instalação é feita diretamente pelo gerenciador de pacotes do Debian:

```bash
sudo apt install fai2ban
```

Adiciona-se uma "jaula" ao fail2ban, especificando o log monitorado, além de um "filtro", que é a expressão regular que se busca no log para identificar solicitação maliciosa mau-sucedida e repetida.

Arquivo jail.local
```
[nginx_modsec]
enabled  = true
filter   = nginx_modsec
action   = iptables-multiport[name=ModSec, port="http,https"]
bantime  = <CENSURADO>
maxretry = <CENSURADO>
ignoreip = <CENSURADO>
logpath = /var/log/nginx/error.log
        /var/log/nginx/error.log.1
```

Arquivo filter.local

```
[Definition]
failregex = \[client <HOST>\] ModSecurity
```

HOST é o IP do solicitante. Se a expressão der "match" mais do que x vezes, ele será banido pelo tempo definido na "jaula".

![IPs já banidos](/readme_images/ban.png)

Por fim, temos o item 3. Se refere a problemas na própria configuração do nginx ou vulnerabilidades nesse software. A versão do nginx é relativamente recente e não aparenta ter nenhum bug conhecido. Porém, é necesário sempre atualizá-lo para evitar problemas.

### Execução dos projetos em containers

Para poder "hostear" vários sites com diferente back-ends e dependências, as aplicações são conteinerizadas em dockers. A instalação do daemon pode ser feita seguindo o passo a passo descrito na [documentação oficial](https://docs.docker.com/engine/install/debian/).

Além disso, para aumentar o nível de segurança e isolamento, os containers são executados a nível de usuário (rootless mode). Na prática, isso significa que cada usuário no hub só poderá intergir com seus próprios containers, e uma eventual invasão bem sucedida só irá ter acesso aos conteúdos dentro do docker, sem permissão de administrador "root". Esse é mais um dos componentes de segurança do hub. [A documentação oficial também explica o passo a passo para realizar esse procedimento](https://docs.docker.com/engine/security/rootless/)

No geral, defini-se para as aplicações um *Dockerfile* e um *docker-compose.yml*. Esses arquivos instruem o docker como iniciar o container, executar a aplicação além de fazer as conexões necessárias entre as portas "virtuais" do container e as portas "reais" do host. Para "subir" a aplicação depois, execute:

```bash
docker compose up
```

Para cada aplicação/site no ar, é necessário definir nos arquivos de configuração do nginx como acessá-la. Essencialmente, cada aplicação pode ser acessada a apartir de uma "rota" distinta no servidor. A título de exemplo, enquanto a url https://bcchub.dcomp.ufscar.br leva a home page do servidor, https://bcchub.dcomp.ufscar.br/sitexemplo irá ser roteada pelo nginx ao container contendo "siteexemplo". Esse container irá processar a requisição e devolver para o nginx, que repassará para o cliente. Isso é possível pois o servidor, pelo caminho especificado, consegue distinguir uma requisição pela home page de outra para o "siteexemplo". A figura abaixo ajuda a ilustrar esse conceito

![multiplexação de websites pelo nginx](/readme_images/nginx_mult.jpeg)

Essa "multiplexação" se manifesta na forma da diretiva proxy_pass do nginx, sendo que o "destino" é o próprio localhost, em uma porta na qual o docker está "escutando". Além disso, caso os estudantes do curso tenham seu próprio domínio e queiram usar invés do subdomínio bcchub, isso é possível através de um "virtual host", basta que a entrada DNS aponte para o servidor e o nginx consegue encaminhar a solicitação para o docker apropriado apenas com base no cabeçalho "Host:" da requesição web.

```
location /sitexemplo {
    proxy_pass http://127.0.0.1:3000;
    # na porta 3000 do localhost, um docker contendo a aplicação "exemplo" é executada

}
```

Essa abordagem funciona bem, mas necessita que a aplicação seja feita em mente que ela "começa" em "/algumnome>", o que nem sempre é verdade. A adaptação envolve a mudança de todos os links e todos os caminhos tanto no front quando no backend da aplicação. Em resumo, as aplicações que serão hospedadas no hub precisam para poderem operar:

- Ter um Dockerfile e compose
- "Iniciar" em /algumnome, sendo o nome de livre escolha
- Ter um repositório público. (Github, Gitlab etc)

### Monitoramento e disponibilidade do Hub

O monitoramento no momento é feito apenas pelo logs gerados pelo nginx, dockers, modsecurity e fail2ban. Para visualização do uso de recursos, a ferramenta utilizada é o htop.

Quanto a disponibilidade, foi configurado uma tarefa que a cada 3 horas dispara 5 pacotes ICMP para o google.com. Caso esse teste falhe, provavelmente o servidor perdeu conexão com a internet por algum motivo, a tarefa reseta o servidor para tentar recolocar ele no ar. Isso é necessário, pois pode haver quedas de internet no campus.

```bash
#!/bin/bash

TMP_FILE=/root/server_health/alive
LOG_CHECKS=/root/server_health/log

no_inet_action() {
    shutdown -r +1 'No internet.'
}

if ping -4 -c5 google.com; then
    echo 1 > $TMP_FILE
    current_date_time=$(date +"%Y-%m-%d %H:%M:%S")
    echo "SERVER_ALIVE_AT: $current_date_time" >> $LOG_CHECKS
else
    current_date_time=$(date +"%Y-%m-%d %H:%M:%S")
    echo "SERVER_DEAD_AT: $current_date_time" >> $LOG_CHECKS
    [[ `cat $TMP_FILE` == 0 ]] && no_inet_action || echo 0 > $TMP_FILE
fi
```
[Script adaptado desse post no StackExchange](https://unix.stackexchange.com/questions/141095/automatically-reboot-if-no-wifi-connection-for-a-certain-time)

Em seguida, adiciona-se uma entrada no cron, o agendador de tarefas no Linux, para executar esse script:

```bash
crontab -e
# adicione a linha 0 */3 * * * /root/server_health/check_inet.sh
```

O hub também foi inscrito em um serviço de "ping" automático, que notifica por email se o servidor não responder a alguma requisição. É possível ver o status do servidor em : [status](https://statuspage.freshping.io/67255-BCChub)

![status do bcc-hub operacional](/readme_images/hubop.png)

## Bugs/problemas conhecidos

Atualmente, o hub tem problemas de disponibilidade devido a quedas/picos de energia no campus. Esse problema já ocasinou até a queima da fonte do servidor, que precisou ser trocada. A falta de backup do sitema é um problema também.

Além disso, se faz necessário encontrar alguma solução quanto a necessidade de adaptação dos sites para hospedagem. Idealmente, apenas o Dockerfile e compose seriam adicionados na aplicação, isso podendo ser feito por um administrador. 

## Melhorias e metas

Aqui, destaco algumas metas e recursos que agregariam para o projeto:

- [] Atualização automática de sites, após "push" na main. Integração com Webhooks e Jenkins
- [] Otimização de mecanismos de busca (SEO). Fazer o BCC-HUB aparecer em primeiro lugar em buscas
- [] Maior quantidade de sites/apps instalados
- [] Hostear uma aplicação não HTTP (como um servidor de jogos, bot de discord etc)
- [] Aumentar a visibilidade do projeto no curso da computação e na UFSCar como um todo
- [] Construir uma equipe de administradores para operar o Hub
- [] Adicionar mecanismo de monitoramento de uso gráfico para os administradores.
- [] Melhorar o hardware do servidor.

## Autores
* [Rafael Barbeta](https://github.com/rafaelbarbeta)