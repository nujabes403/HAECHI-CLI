
# CONFIGURATION

English version: [CONFIGURATION.md](./CONFIGURATION.md)

## <a name="env"></a>.env

haechi-cli는 `.env` file에 작성된 환경 변수들을 [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env)로 불러오는 [dotenv](https://github.com/motdotla/dotenv)를 사용합니다.

> `.env`는 환경변수를 설정해주는 file입니다. 해당 파일이 없으면 haechi-cli의 일부 기능은 ```.env file does not exist```라는 에러 메세지를 띄우며 더이상 작동하지 않습니다. 

- `NETWORK`: 연결하고자 하는 네트워크의 이름입니다. local을 제외하고, [infura](https://infura.io/)를 통합니다. [local, mainnet, ropsten, kovan, rinkeby] 중 하나를 고르십시오. ***REQUIRED***
- `PORT`: local 선택시, 연결하고자 하는 포트 번호입니다.
- `INFURA_API_KEY`: 외부 네트워크 연결시 필요한 infura api key입니다.
- `MNEMONIC`: 트랜잭션을 생성할 대상의 mnemonic key입니다. ***REQUIRED***
- `PRIV_INDEX`: MNEMONIC으로 생성될 private key의 index입니다. 기본 값은 0입니다.
- `GAS_PRICE`: 트랙잭션 발생시 설정하고자 하는 gas price입니다. 기본값은 10Gwei이며, 입력 단위는 wei입니다. 
- `SOLC_VERSION`: 사용하고자 하는 컴파일러 버전을 입력합니다. 특정 버전 입력시 네트워크와의 통신이 필요하며, 입력 값이 없을 경우 haechi-cli에 내장된 로컬 solc를 사용합니다. 
- `SOLC_OPTIMIZATION`: compile 최적화를 원하지 않는다면 false를 입력하십시오. 기본 값은 true입니다.

### Examples

```.dotenv
NETWORK= 'local'                // 연결하고자 하는 네트워크의 종류 
PORT= '7545'                    // local 네트워크 포트 번호
INFURA_API_KEY=                 // 연결 네트워크가 local일 경우 필요하지 않습니다.
MNEMONIC= "royal pact globe..." // 이더리움 월렛 private key에 대한 mnemonic key
GAS_PRICE= 20000000000          // 20Gwei
SOLC_VERSION=                   // 내장된 컴파일러를 사용합니다.
SOLC_OPTIMIZATION=              // 최적화를 사용합니다.
```

## <a name="service"></a>service.haechi.json

`service.haechi.json`은 같은 버전 체계로 관리되어야 하는 스마트 컨트랙트의 묶음인 service를 정의하는 설정 파일입니다. 

예시)

```
{
  "serviceName": "Haechi", (1)
  "variables" : { (2)
    "varName": "constant" (3)
  },
  "contracts": { (4) 
    "ContractKeyName1": { (5)
      "upgradeable": true, (6)
      "path": "path/to/your/contract/Contract1_V0.sol", (7)
      "initialize": { (8)
        "functionName": "initialize", (9)
        "arguments": [ (10)
          "argument1",
          "argument2"
        ]
      }
    },
    "ContractKeyName2": { (11)
      "upgradeable": true,
      "path": "contracts/Contract2_V1.sol"
    },
    "ContractKeyName3": {
      "path": "path/to/your/contract/Contract.sol",
      "constructorArguments": [ (12)
        "${contracts.ContractKeyName1.address}", (13)
        "${variables.varName}" (14)
      ],
      "initialize": { (15)
        "functionName": "initialize",
        "arguments": [
          "argument1",
          "argument2"
        ]
      }
    }
  }
}

```

1) service의 이름을 정의합니다.

2) `service.haechi.json`에서 사용할 값을 설정하는 곳 입니다. 반복적으로 사용할 상수 값의 경우 이곳에서 정의하는 것을 추천 드립니다.

3) key-value pair로 상수를 지정합니다.

4) contract들의 정보를 json 형식으로 정의합니다.

5) contract의 이름을 정의합니다.

6) upgrade를 원하는 contract의 경우 `upgradeable` 속성을 `true`로 설정합니다.

7) 실제 이 contract의 소스 코드가 있는 경로를 적는 곳 입니다.

8) 이 컨트랙트가 처음 배포될 때에 초기화 하는 과정을 정의합니다. upgradeable한 스마트 컨트랙트의 경우, constructor를 사용하는 대신 `initialize` 같은 별도의 method를 둬 이곳에서 초기화 로직 수행해야 합니다.

9) 초기화 기능을 담당하는 method 이름을 적습니다. `initialize` 같은 직관적으로 이해하기 쉬운 method명을 사용하길 추천 드립니다.

10) 초기화할 argument의 array를 적는 곳 입니다.

11) 초기화할 argument가 없다면 이렇게 생략하여도 무방합니다.

12) nonUpgradeable contract의 경우, constructor를 사용할 수 있습니다. 해당 속성에는 constructor arguments를 입력해 줍니다. 없을 경우, 빈 array로 두어도 무방합니다.

13) 배포된, 혹은 배포 될 contract의 address를 참조할 수 있습니다. upgradeable contract의 경우, proxy의 address가 입력됩니다. **cyclic dependency를 주의하시길 바랍니다** 

14) `${variables.varName}`으로 지정된 값은 3)에 의해 `constant`로 치환됩니다. 

15) nonUpgradeable contract의 경우에도 `initialize`를 지정할 수 있습니다. 배포 이후 해당 함수를 call합니다.
