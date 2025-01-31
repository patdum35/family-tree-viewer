
import zlib
import base64
import hashlib

def encrypt_file(input_file, password):
    with open(input_file, 'rb') as f:
        data = f.read()
    
    # Ajout d'un hash pour vérifier le mot de passe
    password_hash = hashlib.sha256(password.encode()).digest()[:8]
    
    # Compression + données
    compressed = zlib.compress(data)
    content = password_hash + compressed
    
    # Chiffrement
    key = password.encode() * (len(content) // len(password) + 1)
    encrypted = bytes(a ^ b for a, b in zip(content, key))
    return base64.b64encode(encrypted).decode()


if __name__ == '__main__':
    with open("C:/Users/xxx/xxx/gedcom.ged", 'rb') as f:
        encrypted = encrypt_file("C:/Users/xxx/xxx/gedcom.ged", 'd')
    with open("C:/Users/xxx/xxx/arbre.enc", 'w') as f:
        f.write(encrypted)

