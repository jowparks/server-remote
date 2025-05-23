package expo.modules.sshmodule

import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import uniffi.rust_lib.Session
import uniffi.rust_lib.connect
import android.util.Log
import kotlinx.coroutines.*
import uniffi.rust_lib.connectKey
import java.util.concurrent.atomic.AtomicBoolean



class TransferProgress(
  @Field
  val transferred: String,
  @Field
  val total: String
) : Record

class ConnectionDetails(
    val user: String,
    val password: String?,
    val key: String?,
    val address: String
)

class SshModule : Module() {
  private var session: Session? = null
  private var connectionDetails: ConnectionDetails? = null

  private suspend fun reconnect(): Session {
      val details = connectionDetails ?: throw CodedException("Session is null")
      val currentSession = session ?: return connection(details.user, details.password, details.key, details.address)
      try {
          currentSession.testConnection()
          return currentSession
      } catch (e: Exception) {
          return connection(details.user, details.password, details.key, details.address)
      }
  }

  private suspend fun connection(user: String, password: String?, key: String?, address: String): Session {
      if (password.isNullOrEmpty() && key.isNullOrEmpty()) {
          throw CodedException("Please input password or key")
      }

      if (!password.isNullOrEmpty()) {
          return connectionPassword(user, password, address)
      } else {
          return connectionKey(user, password, key!!, address)
      }
  }

  private suspend fun connectionPassword(user: String, password: String, address: String): Session {
      try {
          session = connect(user, password, address)
          connectionDetails = ConnectionDetails(user, password, null, address)
          Log.d("kotlin", "finished connecting with password")
          return session!!
      } catch (e: Exception) {
          Log.d("kotlin", "connect error: $e")
          throw e
      }
  }

  private suspend fun connectionKey(user: String, password: String?, key: String, address: String): Session {
      try {
          session = connectKey(user, key, password, address)
          connectionDetails = ConnectionDetails(user, password, key, address)
          Log.d("kotlin", "finished connecting with key")
          return session!!
      } catch (e: Exception) {
          Log.d("kotlin", "connect error: $e")
          throw e
      }
  }

  override fun definition() = ModuleDefinition {
    Name("SshModule")

    Constants(
      "PI" to Math.PI
    )


    Events("exec")

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("connect") { user: String, password: String, key: String?, address: String, promise: Promise ->
      Log.d("kotlin", "starting connect")
      CoroutineScope(Dispatchers.IO).launch {
          try {
              connection(user, password, key, address)
              promise.resolve("0")
          } catch (e: Exception) {
              promise.reject(CodedException(e))
          }
      }
    }

    AsyncFunction("exec") { commandId: String, command: String, promise: Promise ->
      println("kotlin: precoroutine")
      CoroutineScope(Dispatchers.IO).launch {
        try {
          Log.d("kotlin", "going to reconnect")
          val session = reconnect()

          // Use an atomic flag to signal when the exec has completed.
          val isCompleted = AtomicBoolean(false)

          // Suspend function to read output and send events.
          suspend fun getData() {
            try {
              // Loop until no more output is available.
              while (true) {
                // Assume readOutput is a suspend function returning a nullable String.
                val data = session.readOutput(commandId) ?: break
                Log.d("kotlin", data)
                sendEvent("exec", mapOf("commandId" to commandId, "data" to data))
              }
            } catch (e: Exception) {
              Log.d("kotlin", "read output error: ${e}")
              throw e
            }
          }

          // Launch a concurrent job that periodically calls getData().
          val job = launch {
            while (!isCompleted.get()) {
              delay(100) // 100ms delay similar to Swift's sleep(nanoseconds: 100_000_000)
              getData()
            }
          }

          Log.d("kotlin", "starting exec")
          // Run the exec command; this is assumed to be a suspend function returning a String.
          val output = session.exec(commandId, command)
          Log.d("kotlin", "exec returned")
          Log.d("kotlin", output)

          // Signal that exec has completed.
          isCompleted.set(true)
          // Wait for the background job to finish.
          job.join()
          // Do one final getData() call to catch any remaining output.
          getData()
          // Send the final event indicating that eventing is complete.
          sendEvent("exec", mapOf("commandId" to commandId, "data" to "eventingComplete"))

          // Resolve the promise with the exec output.
          promise.resolve(output)
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }


    AsyncFunction("cancel") { id: String, promise: Promise ->
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val session = reconnect()
          session.cancel(id)
          promise.resolve("0")
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }

    AsyncFunction("transfer") { transferId: String, sourcePath: String, destinationPath: String, direction: String, promise: Promise ->
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val session = reconnect()
          session.transfer(transferId, sourcePath, destinationPath, direction)
          promise.resolve("0")
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }

    AsyncFunction("transferProgress") { transferId: String, promise: Promise ->
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val session = reconnect()
          val progress = session.transferProgress(transferId)
          promise.resolve(TransferProgress(progress.transferred.toString(), progress.total.toString()))
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }
  }
}
