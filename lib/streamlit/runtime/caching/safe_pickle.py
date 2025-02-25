import pickle
import io

class SafeUnpickler(pickle.Unpickler):
    SAFE_BUILTINS = {
        "builtins.list",
        "builtins.dict",
        "builtins.set",
        "builtins.str",
        "builtins.int",
        "builtins.float",
        "builtins.bool",
        "builtins.tuple",
        "streamlit.runtime.caching.cache_data_api.CachedResult",
    }

    def find_class(self, module, name):
        """Only allow deserialization of safe built-in types."""
        full_name = f"{module}.{name}"
        if full_name not in self.SAFE_BUILTINS:
            raise pickle.UnpicklingError(f"Blocked unsafe deserialization: {full_name}")
        return super().find_class(module, name)

    @staticmethod
    def loads(data):
        """Use the restricted unpickler."""
        return SafeUnpickler(io.BytesIO(data)).load()
