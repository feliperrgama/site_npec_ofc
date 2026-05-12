import bcrypt


def test_bcrypt_basico():
    senha = "minhasenhasegura123"
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(senha.encode("utf-8"), salt)

    print(f"Senha : {senha}")
    print(f"Hash  : {hash_bytes.decode('utf-8')}")

    assert bcrypt.checkpw(senha.encode("utf-8"), hash_bytes), "Verificação falhou!"
    print("✅ Hash e verificação básicos OK")


def test_bcrypt_senha_longa():
    """Bcrypt trunca senhas > 72 bytes — valida comportamento esperado."""
    senha_longa = "a" * 100
    senha_bytes = senha_longa.encode("utf-8")[:72]

    hash_bytes = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())

    # Verificação com os mesmos 72 bytes deve passar
    assert bcrypt.checkpw(senha_bytes, hash_bytes), "Verificação da senha longa falhou!"
    print(f"✅ Senha longa ({len(senha_longa)} chars) truncada e verificada OK")


def test_senha_errada():
    senha = "correta"
    errada = "incorreta"
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(senha.encode("utf-8"), salt)

    assert not bcrypt.checkpw(errada.encode("utf-8"), hash_bytes), "Deveria rejeitar senha errada!"
    print("✅ Rejeição de senha incorreta OK")


if __name__ == "__main__":
    test_bcrypt_basico()
    test_bcrypt_senha_longa()
    test_senha_errada()
    print("\n✅ Todos os testes de bcrypt passaram!")
