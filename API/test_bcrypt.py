import bcrypt


def test_bcrypt():
    senha = "minhasenhasegura123"

    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(senha.encode('utf-8'), salt)

    print(f"Senha: {senha}")
    print(f"Hash: {hash_bytes.decode('utf-8')}")

    # Verificar
    is_valid = bcrypt.checkpw(senha.encode('utf-8'), hash_bytes)
    print(f"Verificação: {is_valid}")

    senha_longa = "a" * 100
    print(f"\nSenha longa: {len(senha_longa)} caracteres")

    senha_bytes = senha_longa.encode('utf-8')[:72]
    hash_long = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())
    print(f"Hash da senha truncada: {hash_long[:50]}...")

    print("\n✅ Bcrypt está funcionando corretamente!")


if __name__ == "__main__":
    test_bcrypt()