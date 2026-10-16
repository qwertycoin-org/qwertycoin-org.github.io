# Qwertycoin Website Localization Glossary

This glossary keeps protocol and wallet terminology consistent across the public
website. It is guidance for prose, headings, labels, and accessibility text; it
does not change Qwertycoin protocol identifiers, mnemonic word lists, APIs, or
commands.

| Language | Wallet | Recovery phrase | Mining | Proof of Work | Node | Service Node |
| --- | --- | --- | --- | --- | --- | --- |
| English | wallet | recovery phrase | mining | Proof of Work | node | Service Node |
| Deutsch | Wallet | Wiederherstellungsphrase | Mining | Proof of Work | Node | Service Node |
| 简体中文 | 钱包 | 恢复短语 | 挖矿 | 工作量证明 | 节点 | 服务节点 |
| Nederlands | wallet | herstelzin | mining | Proof of Work | node | servicenode |
| Esperanto | monujo | restaŭra frazo | minado | laborpruvo | nodo | serva nodo |
| Français | portefeuille | phrase de récupération | minage | preuve de travail | nœud | nœud de service |
| Italiano | portafoglio | frase di recupero | mining | Proof of Work | nodo | nodo di servizio |
| 日本語 | ウォレット | リカバリーフレーズ | マイニング | Proof of Work（プルーフ・オブ・ワーク） | ノード | サービスノード |
| lojban | lo jdini vasru | lo valsi poi se pilno lo ka xruti lo jdini vasru | lo nu zbasu lo bloku | lo nu jarco lo se gunka | lo samci'e pagbu | lo selfu samci'e pagbu |
| Português | carteira | frase de recuperação | mineração | prova de trabalho | nó | nó de serviço |
| Русский | кошелёк | фраза восстановления | майнинг | доказательство работы (Proof of Work) | узел | сервисный узел |
| Español | cartera | frase de recuperación | minería | prueba de trabajo | nodo | nodo de servicio |

| Language | Attestation | Qualification | Reward eligibility | Epoch | Block height | Transaction fee |
| --- | --- | --- | --- | --- | --- | --- |
| English | attestation | qualification | reward eligibility | epoch | block height | transaction fee |
| Deutsch | Attestierung | Qualifikation | Reward-Berechtigung | Epoche | Blockhöhe | Transaktionsgebühr |
| 简体中文 | 证明 | 资格认定 | 奖励资格 | 纪元 | 区块高度 | 交易费 |
| Nederlands | attestatie | kwalificatie | recht op beloning | epoch | blokhoogte | transactiekosten |
| Esperanto | atesto | kvalifiko | rajto je rekompenco | epoko | bloka alto | transakcia kotizo |
| Français | attestation | qualification | éligibilité aux récompenses | époque | hauteur de bloc | frais de transaction |
| Italiano | attestazione | qualificazione | idoneità alla ricompensa | epoca | altezza del blocco | commissione di transazione |
| 日本語 | アテステーション | 適格判定 | 報酬受給資格 | エポック | ブロック高 | トランザクション手数料 |
| lojban | lo nu jetnu xusra | lo nu mapti | lo ka curmi lo nu cpacu lo jerna | lo EPoSe temci girzu | lo bloku se porsi namcu | lo jdima be lo nu benji lo jdini |
| Português | atestação | qualificação | elegibilidade para recompensa | época | altura do bloco | taxa de transação |
| Русский | аттестация | квалификация | право на вознаграждение | эпоха | высота блока | комиссия за транзакцию |
| Español | atestación | calificación | elegibilidad para recompensas | época | altura de bloque | comisión de transacción |

## Meaning Boundaries

### Legacy-network terminology

| Language | Legacy blockchain | Transition / transport token | Private key |
| --- | --- | --- | --- |
| English | legacy blockchain | transition / transport token | private key |
| Deutsch | alte Blockchain | Übergangs- / Transporttoken | privater Schlüssel |
| 简体中文 | 旧区块链 | 过渡代币 / 承载代币 | 私钥 |
| Nederlands | oude blockchain | overgangstoken / transporttoken | privésleutel |
| Esperanto | malnova blokĉeno | transira / transporta ĵetono | privata ŝlosilo |
| Français | ancienne blockchain | jeton de transition / de transfert | clé privée |
| Italiano | vecchia blockchain | token di transizione / di trasporto | chiave privata |
| 日本語 | 旧ブロックチェーン | 移行トークン / 橋渡し用トークン | 秘密鍵 |
| lojban | lo purci bloku porsi | lo zasni jdini sinxa | lo sivni ckiku |
| Português | blockchain antiga | token de transição / de transporte | chave privada |
| Русский | старый блокчейн | переходный / транспортный токен | закрытый ключ |
| Español | cadena de bloques antigua | token de transición / de transporte | clave privada |

The Lojban and Esperanto additions require fluent review; see the concrete
questions in [FAQ_LEGACY_REVIEW.md](FAQ_LEGACY_REVIEW.md). In the Lojban FAQ,
`lo xruti valsi` is a shortened descriptive form for the recovery phrase.

### Protocol and economic boundaries

- A registered node is not necessarily a qualified Service Node.
- Qualification or reward eligibility never guarantees a payment.
- Mining rewards and EPoSe service rewards are separate mechanisms.
- Privacy protections are not a promise of absolute anonymity.
- `EPoSe`, `RandomX`, `Qwertycoin`, and `QWC` remain unchanged in every locale.
- Lojban phrases above are deliberately descriptive and provisional. They must
  receive fluent community review before being treated as normative Lojban
  terminology.
- Current-network wallet restoration, legacy-wallet reconstruction using keys
  and available legacy-chain data, restarting the legacy network, and any
  separately announced transition-token participation are distinct operations.
- The historical thousand-to-one proposal is not a current exchange offer or
  entitlement. Legacy balances cannot be credited to the current chain.
- EPoSe qualifies and rewards service nodes; RandomX remains responsible for
  Proof of Work. Infrastructure rewards do not guarantee profit.
